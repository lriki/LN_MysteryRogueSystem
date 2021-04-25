import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { LActivity } from "ts/objects/activities/LActivity";
import { LEatActivity } from "ts/objects/activities/LEatActivity";
import { LEntity } from "ts/objects/LEntity";
import { REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { LBehavior, onEatReaction } from "../LBehavior";


export class LEaterBehavior extends LBehavior {
    
    
    onQueryActions(actions: DActionId[]): DActionId[] {
        actions.push(DBasics.actions.EatActionId);
        return actions;
    }

    
    onActivity(self: LEntity, context: SCommandContext, activity: LActivity): REResponse {
        if (activity instanceof LEatActivity) {
            console.log("------eat");

            const reactor = activity.object();
            if (reactor) {
                context.post(reactor, self, undefined, onEatReaction);
            }
            
            return REResponse.Succeeded;
        }
        
        return REResponse.Pass;
    }

}
