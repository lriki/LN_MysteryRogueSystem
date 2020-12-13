import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { REGame_Entity } from "../REGame_Entity";
import { LBehavior } from "./LBehavior";




/**
 * 
 */
export class LItemUserBehavior extends LBehavior {

    onAction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {
        return super.onAction(entity, context, cmd);
    }

    
    onReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {
        return super.onReaction(entity, context, cmd);
    }
}

