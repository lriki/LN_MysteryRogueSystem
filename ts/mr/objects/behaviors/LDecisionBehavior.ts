import { SManualActionDialog } from "ts/mr/system/dialogs/SManualDecisionDialog";
import { SPhaseResult } from "../../system/SCommand";
import { SCommandContext } from "../../system/SCommandContext";
import { DecisionPhase, LBehavior } from "./LBehavior";
import { LEntity } from "ts/mr/objects/LEntity";
import { REGame } from "ts/mr/objects/REGame";
import { LUnitBehavior } from "./LUnitBehavior";
import { UMovement } from "ts/mr/usecases/UMovement";
import { LCharacterAI } from "../ai/LCharacterAI";
import { LActivity } from "../activities/LActivity";
import { LCharacterAI_Normal } from "../ai/LStandardAI";
import { MRSerializable } from "ts/mr/Common";
import { LActionTokenType } from "../LActionToken";
import { LActionTokenConsumeType } from "../LCommon";

/**
 * Scheduler から通知された各タイミングにおいて、行動決定を行う Behavior.
 * 
 * この Behavior は標準的な行動決定のみ行う。
 * 状態異常による行動制限(&経過ターンのデクリメント)・暴走は、状態異常の Behavior 側で onDecisionPhase() をフックして実装する。
 */
@MRSerializable
export class LDecisionBehavior extends LBehavior {
    _characterAI: LCharacterAI_Normal = new LCharacterAI_Normal();

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LDecisionBehavior);
        b._characterAI = this._characterAI.clone() as LCharacterAI_Normal;
        return b;
    }

    public characterAI(): LCharacterAI_Normal {
        return this._characterAI;
    }

    onQueryCharacterAI(characterAIs: LCharacterAI[]): void {
        characterAIs.push(this._characterAI);
    }

    onDecisionPhase(self: LEntity, cctx: SCommandContext, phase: DecisionPhase): SPhaseResult {

        if (phase == DecisionPhase.Manual) {    // TODO: Manual っていう名前が良くない気がするので直したい。

            const unit = self.getEntityBehavior(LUnitBehavior);
            unit._fastforwarding = false;

            if (unit._straightDashing && UMovement.checkDashStopBlock(self)) {
                cctx.postActivity(LActivity.makeMoveToAdjacent(self, self.dir).withConsumeAction(LActionTokenConsumeType.MinorActed));
                return SPhaseResult.Handled;
            }
            else {
                const dialog = new SManualActionDialog();
                dialog.dashingEntry = unit._straightDashing;
                cctx.openDialog(self, dialog, false);
                unit.clearStraightDashing();
                return SPhaseResult.Handled;
            }

        }
        else if (phase == DecisionPhase.AIMinor) {
            return this._characterAI.thinkMoving(cctx, self);
        }
        else if (phase == DecisionPhase.ResolveAdjacentAndMovingTarget) {
            // 後続をブロックする理由はない
            return SPhaseResult.Pass;
        }
        else if (phase == DecisionPhase.AIMajor) {
            return this._characterAI.thinkAction(cctx, self);
            
        }

        return SPhaseResult.Pass;
    }

}