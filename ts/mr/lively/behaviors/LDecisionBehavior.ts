import { SPlayerDialog } from "ts/mr/system/dialogs/SPlayerDialog";
import { SPhaseResult } from "../../system/SCommand";
import { SCommandContext } from "../../system/SCommandContext";
import { DecisionPhase, LBehavior } from "./LBehavior";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { MRLively } from "ts/mr/lively/MRLively";
import { LUnitBehavior } from "./LUnitBehavior";
import { UMovement } from "ts/mr/utility/UMovement";
import { LCharacterAI } from "../ai/LCharacterAI";
import { LActivity } from "../activities/LActivity";
import { LCharacterAI_Normal } from "../ai/LStandardAI";
import { assert, MRSerializable } from "ts/mr/Common";
import { LActionTokenConsumeType } from "../LCommon";
import { LRouteSearch } from "../helpers/LRouteSearch";
import { paramUseThinkingAgent } from "ts/mr/PluginParameters";
import { LThinkingAgent_Standard } from "../ai2/LThinkingAgent_Standard";
import { LThinkingAgent } from "../ai2/LThinkingAgent";

/**
 * Scheduler から通知された各タイミングにおいて、行動決定を行う Behavior.
 * 
 * この Behavior は標準的な行動決定のみ行う。
 * 状態異常による行動制限(&経過ターンのデクリメント)・暴走は、状態異常の Behavior 側で onDecisionPhase() をフックして実装する。
 */
@MRSerializable
export class LDecisionBehavior extends LBehavior {
    _characterAI: LCharacterAI_Normal = new LCharacterAI_Normal();
    _thinkingAgent: LThinkingAgent_Standard = new LThinkingAgent_Standard();

    forceMajorActivity: LActivity | undefined;  // for test

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LDecisionBehavior);
        b._characterAI = this._characterAI.clone() as LCharacterAI_Normal;
        return b;
    }

    public characterAI(): LCharacterAI_Normal {
        return this._characterAI;
    }

    
    public onCollectThinkingAgent(actions: LThinkingAgent[]): void {
        actions.push(this._thinkingAgent);
    }

    onDecisionPhase(self: LEntity, cctx: SCommandContext, phase: DecisionPhase): SPhaseResult {

        if (phase == DecisionPhase.Manual) {    // TODO: Manual っていう名前が良くない気がするので直したい。

            const unit = self.getEntityBehavior(LUnitBehavior);
            unit._fastforwarding = false;

            if (this.decideAutoMove(cctx, self, unit)) {
                return SPhaseResult.Handled;
            }
            
            const dialog = new SPlayerDialog();
            cctx.openDialog(self, dialog, false);
            unit.clearStraightDashing();
            return SPhaseResult.Handled;
        }
        else if (phase == DecisionPhase.AIMinor) {
            if (this.forceMajorActivity) {
                return SPhaseResult.Pass;
            }

            if (paramUseThinkingAgent) {
                self.think();
                assert(self.thinkingAgent);
                return self.thinkingAgent.executeMinorActionIfNeeded(cctx, self);
            }
            else {
                return this._characterAI.thinkMoving(cctx, self);
            }
        }
        else if (phase == DecisionPhase.ResolveAdjacentAndMovingTarget) {
            // 後続をブロックする理由はない
            return SPhaseResult.Pass;
        }
        else if (phase == DecisionPhase.AIMajor) {
            if (this.forceMajorActivity) {
                cctx.postActivity(this.forceMajorActivity);
                return SPhaseResult.Handled;
            }
            if (paramUseThinkingAgent) {
                if (self.thinkingAgent) {
                    return self.thinkingAgent.executeMajorActionIfNeeded(cctx, self);
                }
                else {
                    // 仮眠状態の Enemy が起きた場合、ステート側の onDecisionPhase で Minor がハンドルされた後、Major に飛んでくることがある。
                    return SPhaseResult.Pass;
                }
            }
            else {
                return this._characterAI.thinkAction(cctx, self);
            }
        }

        return SPhaseResult.Pass;
    }

    private decideAutoMove(cctx: SCommandContext, self: LEntity, unit: LUnitBehavior): boolean {

        if (unit.dashInfo) {
            let dir = self.dir;
            if (unit.dashInfo.targetX !== undefined && unit.dashInfo.targetY !== undefined) {
                if (self.mx == unit.dashInfo.targetX && self.my == unit.dashInfo.targetY) {
                    return false;   // 到達済み
                }

                let d = LRouteSearch.findDirectionTo(MRLively.mapView.currentMap, self, self.mx, self.my, unit.dashInfo.targetX, unit.dashInfo.targetY);
                if (d) {
                    dir = d;
                }
            }

            if (UMovement.checkDashStopBlock(self, dir, unit.dashInfo.type)) {
                cctx.postActivity(LActivity.makeMoveToAdjacent(self, dir)
                    .withEntityDirection(dir)
                    .withConsumeAction(LActionTokenConsumeType.MinorActed));
                return true;
            }
        }

        return false;
    }
}
