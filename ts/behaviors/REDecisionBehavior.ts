import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { assert } from "../Common";
import { REResponse } from "../system/RECommand";
import { RECommandContext } from "../system/RECommandContext";
import { DecisionPhase, REGame_Behavior } from "../RE/REGame_Behavior";

export class REGame_DecisionBehavior extends REGame_Behavior
{
    onDecisionPhase(context: RECommandContext, phase: DecisionPhase): REResponse {
        context.openDialog(new REManualActionDialog());
        return REResponse.Consumed;
    }

}
