import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { assert } from "../Common";
import { RECommand, REResponse } from "../system/RECommand";
import { RECommandContext } from "../system/RECommandContext";
import { REGame_Behavior } from "../RE/REGame_Behavior";

/**
 * 
 */
export class REUnitBehavior extends REGame_Behavior {
    onAction(cmd: RECommand): REResponse {

        return REResponse.Pass;
    }
}
