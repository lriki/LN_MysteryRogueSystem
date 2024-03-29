import { DSkillId } from "ts/mr/data/DCommon";
import { MRData } from "ts/mr/data/MRData";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { UAction } from "ts/mr/utility/UAction";
import { UMovement } from "ts/mr/utility/UMovement";
import { LActivity } from "../activities/LActivity";
import { LCharacterAI } from "./LCharacterAI";
import { LEntity } from "../entity/LEntity";
import { LEntityId } from "../LObject";
import { MRLively } from "../MRLively";
import { MRSerializable } from "ts/mr/Common";
import { Helpers } from "ts/mr/system/Helpers";
import { LActionTokenConsumeType } from "../LCommon";

interface SkillAction {
    skillId: DSkillId;
    target: LEntityId;
};

export enum LConfusionAIRestriction {
    /** 攻撃しない */
    None = 0,

    /** 敵を攻撃 */
    AttcakToOpponent = 1,

    /** 誰かを攻撃 */
    AttackToOther = 2,

    /** 味方を攻撃 */
    AttcakToFriend = 3,
}

@MRSerializable
export class LConfusionAI extends LCharacterAI {

    /*
    そもそも混乱は AI として実装するべき？ Activity のハンドラの中でフックしてもよいのでは？
    ----------
    Player と AI で処理が全く違う。
    特に AI は Move と Action を別のフェーズで行う必要があるため、そのケアは CharacterAI 側でしか実装できない。
    */

    private _restriction: LConfusionAIRestriction;
    private _candidateSkillActions: SkillAction[];

    public constructor(restriction: LConfusionAIRestriction) {
        super();
        this._restriction = restriction;
        this._candidateSkillActions = [];
    }

    public clone(): LCharacterAI {
        const i = new LConfusionAI(this._restriction);
        for (const s of this._candidateSkillActions) {
            i._candidateSkillActions.push({ skillId: s.skillId, target: s.target });
        }
        return i;
    }
    
    public thinkMoving(cctx: SCommandContext, self: LEntity): SPhaseResult {
        // 方向決定
        const dir = cctx.random().select(UMovement.directions);

        // どのような理由があれ、向きは変更する
        cctx.postActivity(LActivity.makeDirectionChange(self, dir));

        // 移動してみる。移動出来たら行動を消費する。
        if (UMovement.checkPassageToDir(self, dir)) {
            cctx.postActivity(LActivity.makeMoveToAdjacent(self, dir));
            cctx.postConsumeActionToken(self, LActionTokenConsumeType.MinorActed);
            return SPhaseResult.Handled;
        }

        // 通常攻撃できるか試してみる。
        // 実際の攻撃は Major フェーズで行いたいので、ここでは行動は消費しない。
        // 攻撃候補を覚えておく。
        if (this._restriction != LConfusionAIRestriction.None) {
            const block = UMovement.getAdjacentBlock(self, dir);
            let targets = UAction.getSkillEffectiveTargets(self, MRData.skills[MRData.system.skills.normalAttack], false).filter(e => e.mx == block.mx && e.my == block.my);
    
            if (this._restriction == LConfusionAIRestriction.AttcakToFriend) {
                targets = targets.filter(x => Helpers.isFriend(self, x));
            }
            else if (this._restriction == LConfusionAIRestriction.AttcakToOpponent) {
                targets = targets.filter(x => Helpers.isHostile(self, x));
            }
    
            if (targets.length > 0) {
                this._candidateSkillActions.push({ skillId: MRData.system.skills.normalAttack, target: targets[0].entityId() });
                return SPhaseResult.Handled;
            }
        }
        
        // ここまで来てしまったら何もせず待機行動。
        cctx.postConsumeActionToken(self, LActionTokenConsumeType.MajorActed);
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

