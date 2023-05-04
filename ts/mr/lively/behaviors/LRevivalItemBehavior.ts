import { assert, MRSerializable } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import { SCommandResponse, SPhaseResult } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { LEntity } from "../entity/LEntity";
import { MRLively } from "../MRLively";
import { DecisionPhase, LBehavior, LBehaviorGroup } from "./LBehavior";

/**
 * 
 */
@MRSerializable
export class LRevivalItemBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LRevivalItemBehavior);
        return b;
    }

    isCharmBehavior(): boolean {
        return true;
    }

    onStabilizeSituation(self: LEntity, cctx: SCommandContext): SCommandResponse {

        // if (self.isDeathStateAffected()) {
        //     self.removeDeadStates();
        //     assert(!self.isDeathStateAffected());
        // }

        return SCommandResponse.Pass;
    }

}
