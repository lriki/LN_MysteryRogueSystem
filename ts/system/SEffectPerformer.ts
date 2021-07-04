import { DBasics } from "ts/data/DBasics";
import { DEffect, DEffectFieldScopeRange, DRmmzEffectScope } from "ts/data/DEffect";
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


export class SEffectPerformer {

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


        const effect = skill.effect;
        if (effect) {
            this.performeEffect(context, performer, effect, skill.rmmzEffectScope);
        }
    }
    
    public performeEffect(context: SCommandContext, performer: LEntity, effect: DEffect, rmmzEffectScope: DRmmzEffectScope): void {

        const subject = performer.getBehavior(LBattlerBehavior);

        
        if (effect.scope.range == DEffectFieldScopeRange.Front1) {

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
                    const effectSubject = new SEffectorFact(performer, effect, rmmzEffectScope, SEffectIncidentType.DirectAttack);
                    const effectContext = new SEffectContext(effectSubject);
                    //effectContext.addEffector(effector);

                    console.log("performeEffect 2");

                    if (UMovement.checkDiagonalWallCornerCrossing(performer, performer.dir)) {
                        // 斜め向きで壁の角と交差しているので通常攻撃は通らない
                    }
                    else {
                        const rmmzAnimationId = (effect.rmmzAnimationId < 0) ? subject.attackAnimationId() : effect.rmmzAnimationId;
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
        else if (effect.scope.range == DEffectFieldScopeRange.StraightProjectile) {
            
            const bullet = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity(effect.scope.projectilePrefabKey).id));
            REGame.map.appearEntity(bullet, performer.x, performer.y);
            bullet.dir = performer.dir;

            //context.post(magicBullet, magicBullet, args.subject, undefined, onMoveAsMagicBullet);
            
            LProjectableBehavior.startMoveAsSkillEffectProjectile(context, bullet, new SEffectSubject(performer), performer.dir, effect);
            //throw new Error("Not implemented.");


        }
        else {
            throw new Error("Not implemented.");
        }
    }
}
