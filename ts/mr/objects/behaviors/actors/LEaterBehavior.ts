import { MRBasics } from "ts/mr/data/MRBasics";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { LEntity } from "ts/mr/objects/LEntity";
import { SCommandResponse } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { LBehavior } from "../LBehavior";
import { REGame } from "ts/mr/objects/REGame";
import { MRSerializable } from "ts/mr/Common";
import { SActivityContext } from "ts/mr/system/SActivityContext";
import { DActionId } from "ts/mr/data/DCommon";

/**
 * @deprecated see kEntity_スピードドラッグ_A
 */
@MRSerializable
export class LEaterBehavior extends LBehavior {
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LEaterBehavior);
        return b
    }
    
    onQueryActions(actions: DActionId[]): DActionId[] {
        actions.push(MRBasics.actions.EatActionId);
        return actions;
    }

    
    onActivity(self: LEntity, cctx: SCommandContext, actx: SActivityContext): SCommandResponse {
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
