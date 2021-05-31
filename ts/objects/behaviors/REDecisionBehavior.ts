import { REManualActionDialog } from "ts/system/dialogs/REManualDecisionDialog";
import { REResponse, SPhaseResult } from "../../system/RECommand";
import { SCommandContext } from "../../system/SCommandContext";
import { DecisionPhase, LBehavior } from "./LBehavior";
import { LEntity } from "ts/objects/LEntity";
import { REGame } from "ts/objects/REGame";
import { Helpers } from "ts/system/Helpers";
import { RESystem } from "ts/system/RESystem";
import { SAIHelper } from "ts/system/SAIHelper";
import { LEntityId } from "../LObject";
import { LDirectionChangeActivity } from "../activities/LDirectionChangeActivity";
import { LMoveAdjacentActivity } from "../activities/LMoveAdjacentActivity";
import { LUnitBehavior } from "./LUnitBehavior";
import { SMomementCommon } from "ts/system/SMomementCommon";
import { LCharacterAI } from "../LCharacterAI";

/**
 * Scheduler から通知された各タイミングにおいて、行動決定を行う Behavior.
 * 
 * この Behavior は標準的な行動決定のみ行う。
 * 状態異常による行動制限(&経過ターンのデクリメント)・暴走は、状態異常の Behavior 側で onDecisionPhase() をフックして実装する。
 */
export class REGame_DecisionBehavior extends LBehavior {
    _characterAI: LCharacterAI = new LCharacterAI();


    onDecisionPhase(entity: LEntity, context: SCommandContext, phase: DecisionPhase): SPhaseResult {

        if (phase == DecisionPhase.Manual) {    // TODO: Manual っていう名前が良くない気がするので直したい。

            const behavior = entity.getBehavior(LUnitBehavior);
            behavior._fastforwarding = false;

            if (behavior._straightDashing && SMomementCommon.checkDashStopBlock(entity)) {
                context.postActivity(LMoveAdjacentActivity.make(entity, entity.dir));
                context.postConsumeActionToken(entity);
                return SPhaseResult.Handled;
            }
            else {
                const dialog = new REManualActionDialog();
                dialog.dashingEntry = behavior._straightDashing;
                context.openDialog(entity, dialog, false);
                behavior._straightDashing = false;
                return SPhaseResult.Handled;
            }

        }
        else if (phase == DecisionPhase.AIMinor) {
            return this._characterAI.thinkMoving(entity, context);
        }
        else if (phase == DecisionPhase.ResolveAdjacentAndMovingTarget) {

            // 後続をブロックする理由はない
            return SPhaseResult.Pass;
        }
        else if (phase == DecisionPhase.AIMajor) {
            return this._characterAI.thinkAction(entity, context);
            
        }

        return SPhaseResult.Pass;
    }

}
