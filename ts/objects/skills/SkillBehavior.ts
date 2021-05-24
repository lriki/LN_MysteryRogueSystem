import { DBasics } from "ts/data/DBasics";
import { DSkillDataId } from "ts/data/DSkill";
import { REData } from "ts/data/REData";
import { LEntity } from "ts/objects/LEntity";
import { Helpers } from "ts/system/Helpers";
import { SCommandContext } from "ts/system/SCommandContext";
import { SEffectContext, SEffectIncidentType, SEffectorFact, SEffectSubject } from "ts/system/SEffectContext";
import { RESystem } from "ts/system/RESystem";
import { LBattlerBehavior } from "../behaviors/LBattlerBehavior";
import { onAttackReaction } from "../behaviors/LBehavior";
import { REGame } from "../REGame";
import { DEffectCause } from "ts/data/DEffect";
import { SMomementCommon } from "ts/system/SMomementCommon";

export abstract class LSkillBehavior {
    abstract onPerforme(skillId: DSkillDataId, entity: LEntity, context: SCommandContext): void;
}

export class LNormalAttackSkillBehavior extends LSkillBehavior {
    onPerforme(skillId: DSkillDataId, entity: LEntity, context: SCommandContext): void {

        const skill = REData.skills[skillId];
        const subject = entity.getBehavior(LBattlerBehavior);
        ///const effector = new SEffectorFact(entity, skill.effect);
        

        // もともと UntBehavior.onAction() で AttackActionId をフックして処理していたが、こちらに持ってきた。
        // Attack という Action よりは、「スキル発動」という Action を実行する方が自然かも。

        const effect = skill.effectSet.effect(DEffectCause.Affect);
        if (effect) {
            context.postSequel(entity, RESystem.sequels.attack);

            // TODO: 正面3方向攻撃とかの場合はここをループする
            //for ()
            {
                // 攻撃対象決定
                const front = Helpers.makeEntityFrontPosition(entity, 1);
                const block = REGame.map.block(front.x, front.y);
                const target = context.findReactorEntityInBlock(block, DBasics.actions.AttackActionId);
                if (target) {
                    const effectSubject = new SEffectorFact(entity, effect ,skill.scope, SEffectIncidentType.DirectAttack);
                    const effectContext = new SEffectContext(effectSubject);
                    //effectContext.addEffector(effector);


                    if (SMomementCommon.checkDiagonalWallCornerCrossing(entity, entity.dir)) {
                        // 斜め向きで壁の角と交差しているので通常攻撃は通らない
                    }
                    else {
                        const rmmzAnimationId = (skill.rmmzAnimationId < 0) ? subject.attackAnimationId() : skill.rmmzAnimationId;
                        if (rmmzAnimationId > 0) {
                            context.postAnimation(target, rmmzAnimationId, true);
                        }
                        
                        // TODO: SEffectSubject はダミー
                        context.post(target, entity, new SEffectSubject(entity), {effectContext: effectContext}, onAttackReaction);
    
                        //context.postReaction(DBasics.actions.AttackActionId, reacor, entity, effectContext);
                    }
                    
                }
            }

        }
    }
}

