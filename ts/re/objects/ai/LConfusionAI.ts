import { DSkillDataId } from "ts/re/data/DSkill";
import { REData } from "ts/re/data/REData";
import { SPhaseResult } from "ts/re/system/RECommand";
import { RESystem } from "ts/re/system/RESystem";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { UAction } from "ts/re/usecases/UAction";
import { UMovement } from "ts/re/usecases/UMovement";
import { LActivity } from "../activities/LActivity";
import { LActivityPreprocessor } from "../activities/LActivityPreprocessor";
import { LCharacterAI } from "./LCharacterAI";
import { LEntity } from "../LEntity";
import { LEntityId } from "../LObject";
import { REGame } from "../REGame";

interface SkillAction {
    skillId: DSkillDataId;
    target: LEntityId;
};

export class LConfusionAI extends LCharacterAI {

    /*
    そもそも混乱は AI として実装するべき？ Activity のハンドラの中でフックしてもよいのでは？
    ----------
    Player と AI で処理が全く違う。
    特に AI は Move と Action を別のフェーズで行う必要があるため、そのケアは CharacterAI 側でしか実装できない。
    */

    private _candidateSkillActions: SkillAction[];

    public constructor() {
        super();
        this._candidateSkillActions = [];
    }

    public clone(): LCharacterAI {
        const i = new LConfusionAI();
        for (const s of this._candidateSkillActions) {
            i._candidateSkillActions.push({ skillId: s.skillId, target: s.target });
        }
        return i;
    }
    
    public thinkMoving(context: SCommandContext, self: LEntity): SPhaseResult {
        // 方向決定
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
                context.postActivity(LActivity.makePerformSkill(self, RESystem.skills.normalAttack));
            }
            
            this._candidateSkillActions.shift();
        }
        
        // 攻撃の成否に関わらず行動を消費する。
        context.postConsumeActionToken(self);
        return SPhaseResult.Handled;
    }
}

export class LConfusionActivityPreprocessor extends LActivityPreprocessor {
    public preprocess(src: LActivity): LActivity {
        throw new Error("Method not implemented.");
    }
}
