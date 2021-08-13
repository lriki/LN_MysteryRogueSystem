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
import { SkillEmittedArgs } from "ts/data/predefineds/DBasicEvents";


export class SEmittorPerformer {

    /** 発動者 */
    private _performer: LEntity;

    /** スキルとして発動する場合のスキルID. スキルではない場合 0. */
    private _skillId: DSkillDataId = 0;

    /** 発動する効果 */
    private _emittor: DEmittor | undefined;

    /** 発動元となったアイテム (杖など) */
    private _itemEntity: LEntity | undefined;

    /** Emittor がアイテムを対象とする場合、その対象となるアイテム */
    private _selectedTargetItems: LEntity[] = [];

    /** 対象に効果を適用する際の基準となる向き。ノックバック方向等に使用する。0 の場合、performer の向きを採用する。 */
    private _effectDirection = 0;

    private constructor(performer: LEntity) {
        this._performer = performer;
    }

    public static makeWithSkill(performer: LEntity, skillId: DSkillDataId): SEmittorPerformer {
        assert(skillId > 0);
        const i = new SEmittorPerformer(performer);
        i._skillId = skillId;
        return i;
    }

    public static makeWithEmitor(performer: LEntity, emittor: DEmittor): SEmittorPerformer {
        const i = new SEmittorPerformer(performer);
        i._emittor = emittor;
        return i;
    }

    public setSkillId(value: DSkillDataId): this {
        this._skillId = value;
        return this;
    }

    public setEmittor(value: DEmittor): this {
        this._emittor = value;
        return this;
    }

    public setItemEntity(value: LEntity): this {
        this._itemEntity = value;
        return this;
    }

    public setSelectedTargetItems(value: LEntity[]): this {
        this._selectedTargetItems = value;
        return this;
    }

    public setDffectDirection(value: number): this {
        this._effectDirection = value;
        return this;
    }

    public performe(context: SCommandContext): void {
        if (this._skillId > 0) {
            this.performeSkill(context, this._performer, this._skillId);
        }
        else if (this._emittor) {
            this.performeEffect(context, this._performer, this._emittor, (this._effectDirection > 0) ? this._effectDirection : this._performer.dir, this._itemEntity,  this._selectedTargetItems, 0);
        }
        else {
            throw new Error("Unreachable.");
        }
    }






    /**
     * スキル発動
     * 
     * 単純にスキルを発動する。地形や相手の状態による成否はこの中で判断する。
     */
    private performeSkill(context: SCommandContext, performer: LEntity, skillId: DSkillDataId): void {

        const skill = REData.skills[skillId];
        ///const effector = new SEffectorFact(entity, skill.effect);
        

        // もともと UntBehavior.onAction() で AttackActionId をフックして処理していたが、こちらに持ってきた。
        // Attack という Action よりは、「スキル発動」という Action を実行する方が自然かも。


        const effect = skill.emittor();
        if (effect) {
            this.performeEffect(context, performer, effect, performer.dir, undefined, [], skillId);
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

    private raiseSkillEmitted(performer: LEntity, targets: LEntity[], skillId: DSkillDataId): void {
        const args: SkillEmittedArgs = {
            performer: performer,
            targets: targets,
            skillId: skillId,
        };
        REGame.eventServer.publish(DBasics.events.skillEmitted, args)
    }

    
    /**
     * 
     * @param context 
     * @param performer 
     * @param emittor 
     * @param itemData 杖など
     */
    private performeEffect(
        context: SCommandContext,
        performer: LEntity,
        emittor: DEmittor,
        effectDir: number,
        itemEntity: LEntity | undefined,
        selectedItems: LEntity[],
        skillId: DSkillDataId): void {


        // コストで発動可否判断
        if (!this.canPaySkillCost(performer, emittor.costs, itemEntity)) {
            return;
        }

        // コスト消費
        this.paySkillCost(performer, emittor.costs, itemEntity);




        const subject = performer.getBehavior(LBattlerBehavior);

        
        if (emittor.scope.range == DEffectFieldScopeRange.Performer) {
            const effectSubject = new SEffectorFact(performer, emittor.effect, SEffectIncidentType.IndirectAttack, effectDir/*performer.dir*/);
            const effectContext = new SEffectContext(effectSubject, context.random());
    
            if (emittor.effect.rmmzAnimationId) {
                context.postAnimation(performer, emittor.effect.rmmzAnimationId, true);
            }
    
            // アニメーションを Wait してから効果を発動したいので、ここでは post が必要。
            context.postCall(() => {
                effectContext.applyWithWorth(context, [performer]);

                if (skillId > 0) this.raiseSkillEmitted(performer, [performer], skillId);
            });
        }
        else if (emittor.scope.range == DEffectFieldScopeRange.Front1) {

            // TODO: ユーザー側モーション
            context.postSequel(performer, RESystem.sequels.attack);
            
            // TODO: 正面3方向攻撃とかの場合はここをループする
            //for ()
            {
                // 攻撃対象決定
                const target = context.findReactorEntityInBlock(UMovement.getFrontBlock(performer), DBasics.actions.AttackActionId);
                if (target) {
                    const effectSubject = new SEffectorFact(performer, emittor.effect, SEffectIncidentType.DirectAttack, performer.dir);
                    const effectContext = new SEffectContext(effectSubject, context.random());
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
                        context.post(target, performer, new SEffectSubject(performer), {effectContext: effectContext}, onAttackReaction)
                            .then(() => {
                                if (skillId > 0) this.raiseSkillEmitted(performer, [target], skillId);
                                return true;
                            });
                    }
                }
                else {
                    // target が無くても、スキル発動したことは伝える
                    if (skillId > 0) this.raiseSkillEmitted(performer, [], skillId);
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
            const emittorEffect = itemEntity?.data().effectSet.effect(DEffectCause.Hit);

            const actualEmittor = emittorEffect ?? emittor;

            
            LProjectableBehavior.startMoveAsEffectProjectile(context, bullet, new SEffectSubject(performer), performer.dir, emittor.scope.length, actualEmittor.effect);
            //throw new Error("Not implemented.");


        }
        else if (emittor.scope.range == DEffectFieldScopeRange.Selection) {
            const effectSubject = new SEffectorFact(performer, emittor.effect, SEffectIncidentType.IndirectAttack, effectDir/*performer.dir*/);
            const effectContext = new SEffectContext(effectSubject, context.random());


            effectContext.applyWithWorth(context, selectedItems);
        }
        else {
            throw new Error("Not implemented.");
        }
    }
}
