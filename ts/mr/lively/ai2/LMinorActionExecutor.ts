import { assert, MRSerializable } from "ts/mr/Common";
import { DPrefabMoveType } from "ts/mr/data/DPrefab";
import { MRData } from "ts/mr/data/MRData";
import { Helpers } from "ts/mr/system/Helpers";
import { SAIHelper } from "ts/mr/system/SAIHelper";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { UMovement } from "ts/mr/utility/UMovement";
import { LActivity } from "../activities/LActivity";
import { LMovingMethod } from "../ai/LMoveDeterminer";
import { LBlock } from "../LBlock";
import { LActionTokenConsumeType } from "../LCommon";
import { LEntity } from "../LEntity";
import { LThinkingAgent } from "./LThinkingAgent";

@MRSerializable
export class LMinorActionExecutor {
    public clone(): LMinorActionExecutor {
        return new LMinorActionExecutor();
    }
    
    public executeMinorActionIfNeeded(cctx: SCommandContext, agent: LThinkingAgent, self: LEntity): SPhaseResult {
        if (agent.requiredSkillAction) {
            if (agent.requiredSkillAction.action.skillId == MRData.system.skills.wait) {

                const activity = LActivity.make(self);
                if (agent.requiredSkillAction.forceMovedDirection) {
                    activity.withEntityDirection(agent.requiredSkillAction.forceMovedDirection);
                }
                activity.withConsumeAction(LActionTokenConsumeType.MinorActed);
            
                // 隣接していなければ相手を向いて待機。
                // 消費 Token を Major にしてしまうと、倍速1回行動の時に上手く動かないので Minor で消費する。
                cctx.postActivity(activity);
                return SPhaseResult.Handled;
            }
            else if (
                agent.requiredSkillAction.action.skillId == MRData.system.skills.move ||
                agent.requiredSkillAction.action.skillId == MRData.system.skills.escape) {
                // 移動メイン
                if (self.data.prefab().moveType == DPrefabMoveType.Random) {
                    if (this.perform(cctx, agent, self)) {
                        return SPhaseResult.Handled;
                    }
                }
            }
            else {
                // メジャーアクションで何かしたいかもしれない。このフェーズでは何もしない。
                return SPhaseResult.Pass;
            }
        }

        // ここまで来たら、攻撃対象も無いうえに移動ができなかったということ。
        // 例えば、壁に埋まっている状態。

        // FIXME: ここでやるのが最善かわからないが、攻撃対象が決められていない場合は
        // Major Phase でも行動消費するアクションがとれないので、ハングアップしてしまう。
        // ここで消費しておく。
        cctx.postConsumeActionToken(self, LActionTokenConsumeType.WaitActed);
        return SPhaseResult.Handled;
    }
    
    /**
     * 移動実行
     */
    public perform(cctx: SCommandContext, agent: LThinkingAgent, self: LEntity): boolean {
        if (this.performInternal(cctx, agent, self)) {
            agent.clearSkipCount();
            return true;
        }
        return false;
    }

    // 
    private performInternal(cctx: SCommandContext, agent: LThinkingAgent, self: LEntity): boolean {

        // 目的地設定がなされてるのであればそこへ向かって移動する
        if (this.canModeToTarget(agent, self)) {
            if (this.moveToTarget(self, cctx, agent)) {
                return true;
            }
            else {
                // 壁際を斜め移動しようとした等、移動できなかった
                agent._decired.method = LMovingMethod.LHRule;
            }
        }

        if (agent._decired.passageway) {
            this.postMoveToAdjacent(self, agent._decired.passageway, cctx);
            return true;
        }


        if (agent.hasTargetDestination() &&
            self.mx == agent._movingTargetX &&
            self.my == agent._movingTargetY) {
            // 目標座標が指定されているが既に到達済みの場合は、ランダム移動を行わない。
            // 店主など、明示的に移動させない Entity が該当する。
            return true;
        }

        // 左折の法則による移動
        if (agent._decired.method == LMovingMethod.LHRule) {
            const block = UMovement.getMovingCandidateBlockAsLHRule(self, self.dir);
            if (block) {
                this.postMoveToAdjacent(self, block, cctx);

                // 移動後、向きの修正
                const dir = (agent.hasTargetDestination()) ?
                    SAIHelper.distanceToDir(self.mx, self.my, agent._movingTargetX, agent._movingTargetY) : // 目標があるならそちらを向ける
                    UMovement.getLookAtDirFromPos(self.mx, self.my, block.mx, block.my);                    // 目標が無ければ進行方向を向く
                cctx.postActivity(LActivity.makeDirectionChange(self, dir));

                return true;
            }
        }

        agent.increaseSkipCount();
        if (agent.skipCoun >= 6) {
            // 6連続で移動できなかったときはランダム移動
            const candidates = UMovement.getMovableAdjacentTiles(self);
            if (candidates.length > 0) {
                const block = candidates[cctx.random().nextIntWithMax(candidates.length)];
                this.postMoveToAdjacent(self, block, cctx);
                return true;
            }
        }

        return false;
    }

    
    private canModeToTarget(agent: LThinkingAgent, self: LEntity): boolean {
        return agent.hasTargetDestination() && (self.mx != agent._movingTargetX || self.my != agent._movingTargetY);
    }

    private moveToTarget(self: LEntity, cctx: SCommandContext, agent: LThinkingAgent): boolean {
        // 目的地設定済みで、未到達であること
        assert(this.canModeToTarget(agent, self));

        const dir = SAIHelper.distanceToDir(self.mx, self.my, agent._movingTargetX, agent._movingTargetY);
        if (dir != 0 && UMovement.checkPassageToDir(self, dir)) {
            cctx.postActivity(LActivity.makeDirectionChange(self, dir));
            cctx.postActivity(LActivity.makeMoveToAdjacent(self, dir));
            //this.moveToAdjacent(self, block, cctx);
            cctx.postConsumeActionToken(self, LActionTokenConsumeType.MinorActed);
            return true;
        }
        else {
            return false;
        }
    }
    
    private postMoveToAdjacent(self: LEntity, block: LBlock, cctx: SCommandContext): void {
        const dir = Helpers.offsetToDir(block.mx - self.mx, block.my - self.my);
        cctx.postActivity(LActivity.makeDirectionChange(self, dir));
        cctx.postActivity(LActivity.makeMoveToAdjacent(self, dir));
        cctx.postConsumeActionToken(self, LActionTokenConsumeType.MinorActed);
    }

}

