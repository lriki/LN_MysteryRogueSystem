import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { assert } from "../Common";
import { REResponse } from "../system/RECommand";
import { RECommandContext } from "../system/RECommandContext";
import { DecisionPhase, REGame_Behavior } from "../RE/REGame_Behavior";
import { REGame_Entity } from "ts/RE/REGame_Entity";
import { REGame } from "ts/RE/REGame";
import { REData } from "ts/data/REData";

/**
 * Scheduler から通知された各タイミングにおいて、行動決定を行う Behavior.
 * 
 * この Behavior は標準的な行動決定のみ行う。
 * 状態異常による行動制限(&経過ターンのデクリメント)・暴走は、状態異常の Behavior 側で onDecisionPhase() をフックして実装する。
 */
export class REGame_DecisionBehavior extends REGame_Behavior
{
    onDecisionPhase(entity: REGame_Entity, context: RECommandContext, phase: DecisionPhase): REResponse {

        if (phase == DecisionPhase.Manual) {    // TODO: Manual っていう名前が良くない気がするので直したい。
            context.openDialog(entity, new REManualActionDialog());
            return REResponse.Consumed;
        }
        else if (phase == DecisionPhase.AIMinor) {
            // TODO: とりあえず右へ移動するだけ
            let dir = 6;
            if (dir != 0 && REGame.map.checkPassage(entity, dir)) {
                context.postAction(REData.DirectionChangeActionId, entity, undefined, { direction: dir });
                context.postAction(REData.MoveToAdjacentActionId, entity, undefined, { direction: dir });
            }
            context.postConsumeActionToken(entity);
            return REResponse.Consumed;
        }

        return REResponse.Pass;
    }

}
