import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { LActivity } from "ts/objects/activities/LActivity";
import { LEntity } from "ts/objects/LEntity";
import { REResponse } from "ts/system/RECommand";
import { SEffectSubject } from "ts/system/SEffectContext";
import { SCommandContext } from "ts/system/SCommandContext";
import { LBehavior, onEatReaction } from "../LBehavior";
import { REGame } from "ts/objects/REGame";


export class LEaterBehavior extends LBehavior {
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LEaterBehavior);
        return b
    }
    
    onQueryActions(actions: DActionId[]): DActionId[] {
        actions.push(DBasics.actions.EatActionId);
        return actions;
    }

    
    onActivity(self: LEntity, context: SCommandContext, activity: LActivity): REResponse {
        if (activity.actionId() == DBasics.actions.EatActionId) {
            console.log("------eat");

            const reactor = activity.object();
            if (reactor) {
                context.post(reactor, self, new SEffectSubject(self), undefined, onEatReaction);
            }
            
            return REResponse.Succeeded;
        }
        
        return REResponse.Pass;
    }

}
