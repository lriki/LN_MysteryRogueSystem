import { MRSerializable, tr2 } from "ts/mr/Common";
import { SCommandResponse } from "ts/mr/system/SCommand";
import { RESystem } from "ts/mr/system/RESystem";
import { SActivityContext } from "ts/mr/system/SActivityContext";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { SEmittorPerformer } from "ts/mr/system/SEmittorPerformer";
import { LActivity } from "../activities/LActivity";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { LBehavior } from "./LBehavior";

/**
 * 
 */
@MRSerializable
export class LActivityCharmBehavior extends LBehavior {

    clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LActivityCharmBehavior);
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
            RESystem.scheduler.reset();

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
