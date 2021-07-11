import { SManualActionDialog } from "ts/system/dialogs/SManualDecisionDialog";
import { SPhaseResult } from "../../system/RECommand";
import { SCommandContext } from "../../system/SCommandContext";
import { DecisionPhase, LBehavior } from "./LBehavior";
import { LEntity } from "ts/objects/LEntity";
import { REGame } from "ts/objects/REGame";
import { LUnitBehavior } from "./LUnitBehavior";
import { UMovement } from "ts/usecases/UMovement";
import { LCharacterAI } from "../LCharacterAI";
import { LActivity } from "../activities/LActivity";

/**
 * Scheduler から通知された各タイミングにおいて、行動決定を行う Behavior.
 * 
 * この Behavior は標準的な行動決定のみ行う。
 * 状態異常による行動制限(&経過ターンのデクリメント)・暴走は、状態異常の Behavior 側で onDecisionPhase() をフックして実装する。
 */
export class LDecisionBehavior extends LBehavior {
    _characterAI: LCharacterAI = new LCharacterAI();

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LDecisionBehavior);
        b._characterAI = this._characterAI.clone();
        return b;
    }

    onDecisionPhase(entity: LEntity, context: SCommandContext, phase: DecisionPhase): SPhaseResult {

        if (phase == DecisionPhase.Manual) {    // TODO: Manual っていう名前が良くない気がするので直したい。

            const behavior = entity.getBehavior(LUnitBehavior);
            behavior._fastforwarding = false;

            if (behavior._straightDashing && UMovement.checkDashStopBlock(entity)) {
                context.postActivity(LActivity.makeMoveToAdjacent(entity, entity.dir));
                context.postConsumeActionToken(entity);
                return SPhaseResult.Handled;
            }
            else {
                const dialog = new SManualActionDialog();
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
