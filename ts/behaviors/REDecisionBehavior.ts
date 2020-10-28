import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { assert } from "../Common";
import { REResponse } from "../system/RECommand";
import { RECommandContext } from "../system/RECommandContext";
import { DecisionPhase, REGame_Behavior } from "../RE/REGame_Behavior";
import { REGame_Entity } from "ts/RE/REGame_Entity";

export class REGame_DecisionBehavior extends REGame_Behavior
{
    onDecisionPhase(entity: REGame_Entity, context: RECommandContext, phase: DecisionPhase): REResponse {
        context.openDialog(entity, new REManualActionDialog());
        return REResponse.Consumed;
    }

}
