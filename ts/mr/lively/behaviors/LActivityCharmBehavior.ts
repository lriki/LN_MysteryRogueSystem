import { MRSerializable, tr2 } from "ts/mr/Common";
import { SCommandResponse } from "ts/mr/system/SCommand";
import { MRSystem } from "ts/mr/system/MRSystem";
import { SActivityContext } from "ts/mr/system/SActivityContext";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { SEmittorPerformer } from "ts/mr/system/SEmittorPerformer";
import { LActivity } from "../activities/LActivity";
import { LEntity } from "../entity/LEntity";
import { MRLively } from "../MRLively";
import { LBehavior } from "./LBehavior";

/**
 * 
 */
@MRSerializable
export class LActivityCharmBehavior extends LBehavior {

    clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LActivityCharmBehavior);
        return b;
    }

    isCharmBehavior(): boolean {
        return true;
    }
    
    onActivity(self: LEntity, cctx: SCommandContext, actx: SActivityContext): SCommandResponse {
        const owner = this.ownerEntity();
        const activity = actx.activity();

        const reaction = owner.data.findReaction(activity.actionId());
        if (reaction) {
            for (const emittor of reaction.emittors()) {
                SEmittorPerformer.makeWithEmitor(self, self, emittor)
                    .setItemEntity(self)
                    .perform(cctx);
            }

                // TODO: test
            MRSystem.scheduler.reset();

            return SCommandResponse.Handled;
        }
        
        // if (activity.actionId() == REBasics.actions.dead) {
            
        //     return SCommandResponse.Handled;
        // }


        return SCommandResponse.Pass;
    }

    onActivityReaction(self: LEntity, cctx: SCommandContext, activity: LActivity): SCommandResponse {
        // if (activity.actionId() == REBasics.actions.dead) {
            
        //     return SCommandResponse.Handled;
        // }

        return SCommandResponse.Pass;
    }
}
