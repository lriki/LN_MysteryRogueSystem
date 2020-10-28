import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { assert } from "../Common";
import { RECommand, REResponse } from "../system/RECommand";
import { RECommandContext } from "../system/RECommandContext";
import { REGame_Behavior } from "../RE/REGame_Behavior";
import { REData } from "ts/data/REData";
import { REDirectionChangeCommand } from "ts/commands/REDirectionChangeCommand";

/**
 * 
 */
export class REUnitBehavior extends REGame_Behavior {
    onAction(cmd: RECommand): REResponse {

        if (cmd.action().id == REData.DirectionChangeActionId) {
            cmd.actor().dir = (cmd as REDirectionChangeCommand).direction();
            return REResponse.Consumed;
        }

        return REResponse.Pass;
    }
}
