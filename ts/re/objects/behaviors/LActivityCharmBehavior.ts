import { RESerializable, tr2 } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { REData } from "ts/re/data/REData";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SActivityContext } from "ts/re/system/SActivityContext";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { SEmittorPerformer } from "ts/re/system/SEmittorPerformer";
import { UName } from "ts/re/usecases/UName";
import { LActivity } from "../activities/LActivity";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, onGrounded, testPickOutItem } from "./LBehavior";

/**
 * 
 */
@RESerializable
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

        const reaction = owner.data().reactions.find(x => x.actionId == activity.actionId());
        if (reaction) {
            
            SEmittorPerformer.makeWithEmitor(self, self, REData.getEmittorById(reaction.emittingEffect))
                .setItemEntity(self)
                .perform(cctx);

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
