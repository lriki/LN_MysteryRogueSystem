import { DSkillId } from "ts/re/data/DCommon";
import { REData } from "ts/re/data/REData";
import { SPhaseResult } from "ts/re/system/RECommand";
import { RESystem } from "ts/re/system/RESystem";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { UAction } from "ts/re/usecases/UAction";
import { UMovement } from "ts/re/usecases/UMovement";
import { LActivity } from "../activities/LActivity";
import { LCharacterAI } from "./LCharacterAI";
import { LEntity } from "../LEntity";
import { LEntityId } from "../LObject";
import { REGame } from "../REGame";
import { RESerializable } from "ts/re/Common";
import { LActionTokenType } from "../LActionToken";

interface SkillAction {
    skillId: DSkillId;
    target: LEntityId;
};

@RESerializable
export class LBlindAI extends LCharacterAI {
    private _candidateSkillActions: SkillAction[];

    public constructor() {
        super();
        this._candidateSkillActions = [];
    }

    public clone(): LCharacterAI {
        const i = new LBlindAI();
        return i;
    }
    
    public thinkMoving(cctx: SCommandContext, self: LEntity): SPhaseResult {

        // 移動してみる。移動出来たら行動を消費する。
        const frontDir = self.dir;
        if (UMovement.checkPassageToDir(self, frontDir)) {
            cctx.postActivity(
                LActivity.makeMoveToAdjacent(self, frontDir)
                .withConsumeAction(LActionTokenType.Minor));
            return SPhaseResult.Handled;
        }

        // 通常攻撃できるか試してみる。
        // 実際の攻撃は Major フェーズで行いたいので、ここでは行動は消費しない。
        // 攻撃候補を覚えておく。
        const block = UMovement.getAdjacentBlock(self, frontDir);
        const targets = UAction.getSkillEffectiveTargets(self, REData.skills[RESystem.skills.normalAttack], false).filter(e => e.x == block.mx && e.y == block.my);
        if (targets.length > 0) {
            this._candidateSkillActions.push({ skillId: RESystem.skills.normalAttack, target: targets[0].entityId() });
            return SPhaseResult.Handled;
        }

        // 向いている方向以外へランダムにしてみる
        const newDir = cctx.random().select(UMovement.directions.filter(x => x != frontDir));
        //const rightDir = UMovement.rotateDir(6, self.dir);
        if (UMovement.checkPassageToDir(self, newDir)) {
            cctx.postActivity(
                LActivity.makeMoveToAdjacent(self, newDir)
                .withEntityDirection(newDir)
                .withConsumeAction(LActionTokenType.Minor));
            return SPhaseResult.Handled;
        }
        
        // ここまで来てしまったら向きだけ変えて待機。
        cctx.postActivity(
            LActivity.makeDirectionChange(self, newDir)
            .withConsumeAction(LActionTokenType.Major));
        return SPhaseResult.Handled;
    }
    
    public thinkAction(cctx: SCommandContext, self: LEntity): SPhaseResult {

        if (this._candidateSkillActions.length > 0) {
            const action = this._candidateSkillActions[0];
            const target = REGame.world.entity(action.target);
            
            // 攻撃候補が有効なまま存在していれば、相手の方を向いて攻撃
            if (UAction.checkEntityWithinSkillActionRange(self, REData.skills[action.skillId], false, [target])) {
                cctx.postActivity(LActivity.makeDirectionChange(self,  UMovement.getLookAtDir(self, target)));
                cctx.postActivity(LActivity.makePerformSkill(self, RESystem.skills.normalAttack));
            }
            
            this._candidateSkillActions.shift();
        }
        
        // 攻撃の成否に関わらず行動を消費する。
        cctx.postConsumeActionToken(self, LActionTokenType.Major);
        return SPhaseResult.Handled;
    }
}
