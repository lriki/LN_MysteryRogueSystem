import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { assert } from "../Common";
import { RECommand, REResponse } from "../system/RECommand";
import { RECommandContext } from "../system/RECommandContext";
import { REGame_Behavior } from "../RE/REGame_Behavior";
import { REData } from "ts/data/REData";
import { REDirectionChangeCommand, REMoveToAdjacentCommand } from "ts/commands/REDirectionChangeCommand";
import { REGameManager } from "ts/RE/REGameManager";
import { REGame } from "ts/RE/REGame";
import { REGame_Entity } from "ts/RE/REGame_Entity";
import { RESystem } from "ts/system/RESystem";

/**
 * 
 */
export class REUnitBehavior extends REGame_Behavior {
    onAction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {

        if (cmd.action().id == REData.DirectionChangeActionId) {
            cmd.actor().dir = (cmd as REDirectionChangeCommand).direction();
            return REResponse.Consumed;
        }

        if (cmd.action().id == REData.MoveToAdjacentActionId) {
            const c = (cmd as REMoveToAdjacentCommand);
            if (REGame.map.moveEntity(entity, c.x(), c.y(), entity.queryProperty(RESystem.properties.homeLayer))) {

                return REResponse.Consumed;
            }
            
        }
        
        return REResponse.Pass;
    }
}
