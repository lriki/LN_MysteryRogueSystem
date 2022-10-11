import { DSkillId } from "ts/mr/data/DCommon";
import { MRData } from "ts/mr/data/MRData";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { UAction } from "ts/mr/utility/UAction";
import { UMovement } from "ts/mr/utility/UMovement";
import { LActivity } from "../activities/LActivity";
import { LCharacterAI } from "./LCharacterAI";
import { LEntity } from "../LEntity";
import { LEntityId } from "../LObject";
import { MRLively } from "../MRLively";
import { MRSerializable } from "ts/mr/Common";
import { LActionTokenConsumeType } from "../LCommon";

interface SkillAction {
    skillId: DSkillId;
    target: LEntityId;
};

@MRSerializable
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
                .withConsumeAction(LActionTokenConsumeType.MinorActed));
            return SPhaseResult.Handled;
        }

        // 通常攻撃できるか試してみる。
        // 実際の攻撃は Major フェーズで行いたいので、ここでは行動は消費しない。
        // 攻撃候補を覚えておく。
        const block = UMovement.getAdjacentBlock(self, frontDir);
        const targets = UAction.getSkillEffectiveTargets(self, MRData.skills[MRData.system.skills.normalAttack], false).filter(e => e.mx == block.mx && e.my == block.my);
        if (targets.length > 0) {
            this._candidateSkillActions.push({ skillId: MRData.system.skills.normalAttack, target: targets[0].entityId() });
            return SPhaseResult.Handled;
        }

        // 向いている方向以外へランダムにしてみる
        const newDir = cctx.random().select(UMovement.directions.filter(x => x != frontDir));
        //const rightDir = UMovement.rotateDir(6, self.dir);
        if (UMovement.checkPassageToDir(self, newDir)) {
            cctx.postActivity(
                LActivity.makeMoveToAdjacent(self, newDir)
                .withEntityDirection(newDir)
                .withConsumeAction(LActionTokenConsumeType.MinorActed));
            return SPhaseResult.Handled;
        }
        
        // ここまで来てしまったら向きだけ変えて待機。
        cctx.postActivity(
            LActivity.makeDirectionChange(self, newDir)
            .withConsumeAction(LActionTokenConsumeType.MajorActed));
        return SPhaseResult.Handled;
    }
    
    public thinkAction(cctx: SCommandContext, self: LEntity): SPhaseResult {

        if (this._candidateSkillActions.length > 0) {
            const action = this._candidateSkillActions[0];
            const target = MRLively.world.entity(action.target);
            
            // 攻撃候補が有効なまま存在していれば、相手の方を向いて攻撃
            if (UAction.checkEntityWithinSkillActionRange(self, MRData.skills[action.skillId], false, [target])) {
                cctx.postActivity(LActivity.makeDirectionChange(self,  UMovement.getLookAtDir(self, target)));
                cctx.postActivity(LActivity.makePerformSkill(self, MRData.system.skills.normalAttack));
            }
            
            this._candidateSkillActions.shift();
        }
        
        // 攻撃の成否に関わらず行動を消費する。
        cctx.postConsumeActionToken(self, LActionTokenConsumeType.MajorActed);
        return SPhaseResult.Handled;
    }
}
