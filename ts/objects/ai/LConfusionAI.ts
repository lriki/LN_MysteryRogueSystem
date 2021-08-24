import { DSkillDataId } from "ts/data/DSkill";
import { REData } from "ts/data/REData";
import { SPhaseResult } from "ts/system/RECommand";
import { RESystem } from "ts/system/RESystem";
import { SCommandContext } from "ts/system/SCommandContext";
import { SEmittorPerformer } from "ts/system/SEmittorPerformer";
import { CandidateSkillAction, UAction } from "ts/usecases/UAction";
import { UMovement } from "ts/usecases/UMovement";
import { LActivity } from "../activities/LActivity";
import { LCharacterAI } from "../LCharacterAI";
import { LEntity } from "../LEntity";
import { LEntityId } from "../LObject";
import { REGame } from "../REGame";

interface SkillAction {
    skillId: DSkillDataId;
    target: LEntityId;
};

export class LConfusionAI extends LCharacterAI {
    private _candidateSkillActions: SkillAction[];

    public constructor() {
        super();
        this._candidateSkillActions = [];
    }

    public clone(): LCharacterAI {
        const i = new LConfusionAI();
        return i;
    }
    
    public thinkMoving(context: SCommandContext, self: LEntity): SPhaseResult {


        const dir = context.random().select(UMovement.directions);

        // どのような理由があれ、向きは変更する
        context.postActivity(LActivity.makeDirectionChange(self, dir));

        // 移動してみる。移動出来たら行動を消費する。
        if (UMovement.checkPassageToDir(self, dir)) {
            context.postActivity(LActivity.makeMoveToAdjacent(self, dir));
            context.postConsumeActionToken(self);
            return SPhaseResult.Handled;
        }

        // 通常攻撃できるか試してみる。
        // 実際の攻撃は Major フェーズで行いたいので、ここでは行動は消費しない。
        // 攻撃候補を覚えておく。
        const block = UMovement.getAdjacentBlock(self, dir);
        const targets = UAction.getSkillEffectiveTargets(self, REData.skills[RESystem.skills.normalAttack], false).filter(e => e.x == block.x() && e.y == block.y());
        if (targets.length > 0) {
            this._candidateSkillActions.push({ skillId: RESystem.skills.normalAttack, target: targets[0].entityId() });
            return SPhaseResult.Handled;
        }
        
        // ここまで来てしまったら何もせず待機行動。
        context.postConsumeActionToken(self);
        return SPhaseResult.Handled;
    }
    
    public thinkAction(context: SCommandContext, self: LEntity): SPhaseResult {

        if (this._candidateSkillActions.length > 0) {
            const action = this._candidateSkillActions[0];
            const target = REGame.world.entity(action.target);
            
            // 攻撃候補が有効なまま存在していれば、相手の方を向いて攻撃
            if (UAction.checkEntityWithinSkillActionRange(self, REData.skills[action.skillId], false, [target])) {
                context.postActivity(LActivity.makeDirectionChange(self,  UMovement.getLookAtDir(self, target)));
                SEmittorPerformer.makeWithSkill(self, action.skillId).performe(context);
            }
            
            this._candidateSkillActions.shift();
        }
        
        // 攻撃の成否に関わらず行動を消費する。
        context.postConsumeActionToken(self);
        return SPhaseResult.Handled;
    }
}
