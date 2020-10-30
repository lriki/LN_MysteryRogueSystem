import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { assert } from "../Common";
import { RECommand, REResponse } from "../system/RECommand";
import { RECommandContext } from "../system/RECommandContext";
import { REGame_Behavior } from "../RE/REGame_Behavior";
import { REData } from "ts/data/REData";
import { REGameManager } from "ts/system/REGameManager";
import { REGame } from "ts/RE/REGame";
import { REGame_Entity } from "ts/RE/REGame_Entity";
import { RESystem } from "ts/system/RESystem";
import { REDirectionChangeArgs, REMoveToAdjacentArgs } from "ts/commands/RECommandArgs";
import { Helpers } from "ts/system/Helpers";

/**
 * 
 */
export class REUnitBehavior extends REGame_Behavior {
    onAction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {

        if (cmd.action().id == REData.DirectionChangeActionId) {
            cmd.actor().dir = (cmd.args() as REDirectionChangeArgs).direction;
            return REResponse.Consumed;
        }

        if (cmd.action().id == REData.MoveToAdjacentActionId) {
            

            const args = (cmd.args() as REMoveToAdjacentArgs);
            const offset = Helpers.dirToTileOffset(args.direction);

            if (REGame.map.moveEntity(entity, entity.x + offset.x, entity.y + offset.y, entity.queryProperty(RESystem.properties.homeLayer))) {

                context.postSequel(entity, REData.MoveSequel);

                return REResponse.Consumed;
            }
            
        }
        
        return REResponse.Pass;
    }
}
