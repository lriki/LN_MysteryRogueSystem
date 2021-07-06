import { DBasics } from "ts/data/DBasics";
import { DEmittor, DEffectCause, DEffectFieldScopeRange, DRmmzEffectScope } from "ts/data/DEffect";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { DSkillDataId } from "ts/data/DSkill";
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


export class SEmittorPerformer {

    /**
     * スキル発動
     * 
     * 単純にスキルを発動する。地形や相手の状態による成否はこの中で判断する。
     */
    public performeSkill(skillId: DSkillDataId, performer: LEntity, context: SCommandContext): void {

        const skill = REData.skills[skillId];
        ///const effector = new SEffectorFact(entity, skill.effect);
        

        // もともと UntBehavior.onAction() で AttackActionId をフックして処理していたが、こちらに持ってきた。
        // Attack という Action よりは、「スキル発動」という Action を実行する方が自然かも。


        const effect = skill.emittor();
        if (effect) {
            this.performeEffect(context, performer, effect, undefined);
        }
    }
    
    /**
     * 
     * @param context 
     * @param performer 
     * @param emittor 
     * @param item 杖など
     */
    public performeEffect(context: SCommandContext, performer: LEntity, emittor: DEmittor, item: DItem | undefined): void {

        const subject = performer.getBehavior(LBattlerBehavior);

        
        if (emittor.scope.range == DEffectFieldScopeRange.Performer) {

            console.log("applyEffect", emittor);

            const effectSubject = new SEffectorFact(performer, emittor.effect, SEffectIncidentType.IndirectAttack);
            const effectContext = new SEffectContext(effectSubject);
    
            if (item) {
                context.postAnimation(performer, item.animationId, true);
            }
    
            // アニメーションを Wait してから効果を発動したいので、ここでは post が必要。
            context.postCall(() => {
                effectContext.applyWithWorth(context, [performer]);
            });
        }
        else if (emittor.scope.range == DEffectFieldScopeRange.Front1) {

            // TODO: ユーザー側モーション
            context.postSequel(performer, RESystem.sequels.attack);

            console.log("performeEffect 1");
            
            // TODO: 正面3方向攻撃とかの場合はここをループする
            //for ()
            {
                // 攻撃対象決定
                const front = Helpers.makeEntityFrontPosition(performer, 1);
                const block = REGame.map.block(front.x, front.y);
                const target = context.findReactorEntityInBlock(block, DBasics.actions.AttackActionId);
                if (target) {
                    const effectSubject = new SEffectorFact(performer, emittor.effect, SEffectIncidentType.DirectAttack);
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
            
            const bullet = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity(emittor.scope.projectilePrefabKey).id));
            REGame.map.appearEntity(bullet, performer.x, performer.y);
            bullet.dir = performer.dir;

            //context.post(magicBullet, magicBullet, args.subject, undefined, onMoveAsMagicBullet);


            const emittorEffect = item?.effectSet.effect(DEffectCause.Hit);

            const actualEmittor = emittorEffect ?? emittor;

            
            LProjectableBehavior.startMoveAsEffectProjectile(context, bullet, new SEffectSubject(performer), performer.dir, emittor.scope.length, actualEmittor.effect);
            //throw new Error("Not implemented.");


        }
        else {
            throw new Error("Not implemented.");
        }
    }
}
