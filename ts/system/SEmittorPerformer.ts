import { DBasics } from "ts/data/DBasics";
import { DEmittor, DEffectCause, DEffectFieldScopeRange, DRmmzEffectScope, DSkillCostSource, DEmittorCost, DParamCostType, DParamCost } from "ts/data/DEffect";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { DSkill, DSkillDataId } from "ts/data/DSkill";
import { REData } from "ts/data/REData";
import { LProjectableBehavior } from "ts/objects/behaviors/activities/LProjectableBehavior";
import { LBattlerBehavior } from "ts/objects/behaviors/LBattlerBehavior";
import { onAttackReaction } from "ts/objects/internal";
import { LEntity } from "ts/objects/LEntity";
import { REGame } from "ts/objects/REGame";
import { Helpers } from "./Helpers";
import { RESystem } from "./RESystem";
import { SCommandContext } from "./SCommandContext";
import { SEffectContext, SEffectIncidentType, SEffectorFact, SEffectSubject } from "./SEffectContext";
import { SEntityFactory } from "./SEntityFactory";
import { UMovement } from "../usecases/UMovement";
import { DItem } from "ts/data/DItem";
import { assert } from "ts/Common";
import { DParameterId } from "ts/data/DParameter";


export class SEmittorPerformer {

    /**
     * スキル発動
     * 
     * 単純にスキルを発動する。地形や相手の状態による成否はこの中で判断する。
     */
    public performeSkill(context: SCommandContext, performer: LEntity, skillId: DSkillDataId, item: LEntity | undefined): void {

        const skill = REData.skills[skillId];
        ///const effector = new SEffectorFact(entity, skill.effect);
        

        // もともと UntBehavior.onAction() で AttackActionId をフックして処理していたが、こちらに持ってきた。
        // Attack という Action よりは、「スキル発動」という Action を実行する方が自然かも。


        const effect = skill.emittor();
        if (effect) {
            this.performeEffect(context, performer, effect, performer.dir, undefined, undefined);
        }
    }

    private canPayParamCost(entity: LEntity, paramId: DParameterId, cost: DParamCost): boolean {
        if (cost.type == DParamCostType.Decrease) {
            if (entity.actualParam(paramId) < cost.value) return false;
        }
        else if (cost.type == DParamCostType.Increase) {
            const d = entity.idealParam(paramId) - entity.actualParam(paramId);
            if (d < cost.value) return false;
        }
        else {
            throw new Error("Unreachable.");
        }
        return true;
    }

    private payParamCost(entity: LEntity, paramId: DParameterId, cost: DParamCost): void {
        if (cost.type == DParamCostType.Decrease) {
            entity.gainActualParam(paramId, -cost.value);
        }
        else if (cost.type == DParamCostType.Increase) {
            entity.gainActualParam(paramId, cost.value);
        }
        else {
            throw new Error("Unreachable.");
        }
    }

    private canPaySkillCost(performer: LEntity, costs: DEmittorCost, item: LEntity | undefined): boolean {
        const performerCosts = costs.paramCosts[DSkillCostSource.Actor];
        if (performerCosts) {
            for (let paramId = 0; paramId < performerCosts.length; paramId++) {
                const cost = performerCosts[paramId];
                if (cost !== undefined) {
                    if (!this.canPayParamCost(performer, paramId, cost)) return false;
                }
            }
        }
        else {
            // No cost. Available.
        }

        const itemCosts = costs.paramCosts[DSkillCostSource.Item];
        if (itemCosts) {
            for (let paramId = 0; paramId < itemCosts.length; paramId++) {
                const cost = itemCosts[paramId];
                if (cost !== undefined) {
                    if (!item) return false;    // ItemCost があるのに item が無い場合は発動不可能
                    if (!this.canPayParamCost(item, paramId, cost)) return false;
                }
            }
        }
        else {
            // No cost. Available.
        }

        return true;
    }
    
    private paySkillCost(performer: LEntity, costs: DEmittorCost, item: LEntity | undefined): void {
        const performerCosts = costs.paramCosts[DSkillCostSource.Actor];
        if (performerCosts) {
            for (let paramId = 0; paramId < performerCosts.length; paramId++) {
                const cost = performerCosts[paramId];
                if (cost !== undefined) {
                    this.payParamCost(performer, paramId, cost);
                }
            }
        }

        const itemCosts = costs.paramCosts[DSkillCostSource.Item];
        if (itemCosts) {
            for (let paramId = 0; paramId < itemCosts.length; paramId++) {
                const cost = itemCosts[paramId];
                if (cost !== undefined) {
                    assert(item);
                    this.payParamCost(item, paramId, cost);
                }
            }
        }
    }


    
    /**
     * 
     * @param context 
     * @param performer 
     * @param emittor 
     * @param itemData 杖など
     */
    public performeEffect(context: SCommandContext, performer: LEntity, emittor: DEmittor, effectDir: number, itemEntity: LEntity | undefined, itemData: DItem | undefined): void {


        // コストで発動可否判断
        if (!this.canPaySkillCost(performer, emittor.costs, itemEntity)) {
            return;
        }

        // コスト消費
        this.paySkillCost(performer, emittor.costs, itemEntity);




        const subject = performer.getBehavior(LBattlerBehavior);

        
        if (emittor.scope.range == DEffectFieldScopeRange.Performer) {


            const effectSubject = new SEffectorFact(performer, emittor.effect, SEffectIncidentType.IndirectAttack, effectDir/*performer.dir*/);
            const effectContext = new SEffectContext(effectSubject);
    
            if (itemData) {
                context.postAnimation(performer, itemData.animationId, true);
            }
    
            // アニメーションを Wait してから効果を発動したいので、ここでは post が必要。
            context.postCall(() => {
                effectContext.applyWithWorth(context, [performer]);
            });
        }
        else if (emittor.scope.range == DEffectFieldScopeRange.Front1) {

            // TODO: ユーザー側モーション
            context.postSequel(performer, RESystem.sequels.attack);
            
            // TODO: 正面3方向攻撃とかの場合はここをループする
            //for ()
            {
                // 攻撃対象決定
                const front = Helpers.makeEntityFrontPosition(performer, 1);
                const block = REGame.map.block(front.x, front.y);
                const target = context.findReactorEntityInBlock(block, DBasics.actions.AttackActionId);
                if (target) {
                    const effectSubject = new SEffectorFact(performer, emittor.effect, SEffectIncidentType.DirectAttack, performer.dir);
                    const effectContext = new SEffectContext(effectSubject);
                    //effectContext.addEffector(effector);


                    if (UMovement.checkDiagonalWallCornerCrossing(performer, performer.dir)) {
                        // 斜め向きで壁の角と交差しているので通常攻撃は通らない
                    }
                    else {
                        const rmmzAnimationId = (emittor.effect.rmmzAnimationId < 0) ? subject.attackAnimationId() : emittor.effect.rmmzAnimationId;
                        if (rmmzAnimationId > 0) {
                            context.postAnimation(target, rmmzAnimationId, true);
                        }
                        
                        // TODO: SEffectSubject はダミー
                        context.post(target, performer, new SEffectSubject(performer), {effectContext: effectContext}, onAttackReaction);

                        //context.postReaction(DBasics.actions.AttackActionId, reacor, entity, effectContext);
                    }
                    
                }
            }
        }
        else if (emittor.scope.range == DEffectFieldScopeRange.StraightProjectile) {

            // Projectile を発射する Emittor.
            
            const bullet = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity(emittor.scope.projectilePrefabKey).id));
            REGame.map.appearEntity(bullet, performer.x, performer.y);
            bullet.dir = performer.dir;

            //context.post(magicBullet, magicBullet, args.subject, undefined, onMoveAsMagicBullet);


            // Projectile は item とは異なる Entity であり、Projectile 自体はデータベース上では Effect を持たない。
            // そのため、Projectile の発生原因となった item から Hit 時の Effect を取り出し、Projectile 衝突時にこれを発動する。
            const emittorEffect = itemData?.effectSet.effect(DEffectCause.Hit);

            const actualEmittor = emittorEffect ?? emittor;

            
            LProjectableBehavior.startMoveAsEffectProjectile(context, bullet, new SEffectSubject(performer), performer.dir, emittor.scope.length, actualEmittor.effect);
            //throw new Error("Not implemented.");


        }
        else {
            throw new Error("Not implemented.");
        }
    }
}
