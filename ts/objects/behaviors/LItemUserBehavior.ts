import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { LEntity } from "../LEntity";
import { LBehavior } from "./LBehavior";




/**
 * 
 */
export class LItemUserBehavior extends LBehavior {

    onAction(entity: LEntity, context: RECommandContext, cmd: RECommand): REResponse {
        return super.onAction(entity, context, cmd);
    }
}

