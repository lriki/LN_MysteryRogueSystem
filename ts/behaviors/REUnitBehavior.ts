import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { assert } from "../Common";
import { RECommand, REResponse } from "../RE/RECommand";
import { RECommandContext } from "../RE/RECommandContext";
import { REGame_Behavior } from "../RE/REGame_Behavior";

/**
 * 
 */
export class REUnitBehavior extends REGame_Behavior {
    onAction(cmd: RECommand): REResponse {

        return REResponse.Pass;
    }
}
