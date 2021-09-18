import { DActionId } from "ts/re/data/DAction";
import { DBasics } from "ts/re/data/DBasics";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LEntity } from "ts/re/objects/LEntity";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LBehavior } from "../LBehavior";
import { REGame } from "ts/re/objects/REGame";
import { RESerializable } from "ts/re/Common";

/**
 * @deprecated see kItem_スピードドラッグ
 */
@RESerializable
export class LEaterBehavior extends LBehavior {
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LEaterBehavior);
        return b
    }
    
    onQueryActions(actions: DActionId[]): DActionId[] {
        actions.push(DBasics.actions.EatActionId);
        return actions;
    }

    
    onActivity(self: LEntity, context: SCommandContext, activity: LActivity): SCommandResponse {
        /*
        if (activity.actionId() == DBasics.actions.EatActionId) {
            const reactor = activity.object();
            if (reactor) {
                UIdentify.identifyByTiming(context, self, reactor, DIdentifiedTiming.Eat);
                context.post(reactor, self, new SEffectSubject(self), undefined, onEatReaction);
            }
            
            return REResponse.Succeeded;
        }
        */
       
        return SCommandResponse.Pass;
    }

}
