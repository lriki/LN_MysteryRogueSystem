import { DBasics } from "ts/data/DBasics";
import { DSkillDataId } from "ts/data/DSkill";
import { REData } from "ts/data/REData";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { Helpers } from "ts/system/Helpers";
import { RECommandContext } from "ts/system/RECommandContext";
import { REEffectContext, SEffectorFact } from "ts/system/REEffectContext";
import { RESystem } from "ts/system/RESystem";
import { REGame } from "../REGame";

export abstract class LSkillBehavior {
    abstract onPerforme(skillId: DSkillDataId, entity: REGame_Entity, context: RECommandContext): void;
}

export class LNormalAttackSkillBehavior extends LSkillBehavior {
    onPerforme(skillId: DSkillDataId, entity: REGame_Entity, context: RECommandContext): void {

        const skill = REData.skills[skillId];
        ///const effector = new SEffectorFact(entity, skill.effect);
        

        // もともと UntBehavior.onAction() で AttackActionId をフックして処理していたが、こちらに持ってきた。
        // Attack という Action よりは、「スキル発動」という Action を実行する方が自然かも。
        {
            context.postSequel(entity, RESystem.sequels.attack);

            // TODO: 正面3方向攻撃とかの場合はここをループする
            //for ()
            {
                // 攻撃対象決定
                const front = Helpers.makeEntityFrontPosition(entity, 1);
                const block = REGame.map.block(front.x, front.y);
                const reacor = context.findReactorEntityInBlock(block, DBasics.actions.AttackActionId);
                if (reacor) {
                    const effectContext = new REEffectContext(entity, skill.scope, skill.effect, reacor);
                    //effectContext.addEffector(effector);

                    context.postReaction(DBasics.actions.AttackActionId, reacor, effectContext);
                }
            }

        }
    }
}

