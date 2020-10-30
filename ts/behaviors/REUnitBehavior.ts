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
import { REDirectionChangeArgs } from "ts/commands/REDirectionChangeCommand";
import { REMoveToAdjacentArgs } from "ts/commands/RECommandArgs";

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

            if (REGame.map.moveEntity(entity, args.x, args.y, entity.queryProperty(RESystem.properties.homeLayer))) {

                context.postSequel(entity, REData.MoveSequel);

                return REResponse.Consumed;
            }
            
        }
        
        return REResponse.Pass;
    }
}
