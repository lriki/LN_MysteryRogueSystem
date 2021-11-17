import { assert, RESerializable } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { SCommandResponse, SPhaseResult } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LCharacterAI } from "../ai/LCharacterAI";
import { LRatedRandomAI } from "../ai/LRatedRandomAI";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { DecisionPhase, LBehavior, LBehaviorGroup } from "./LBehavior";

/**
 * 
 */
@RESerializable
export class LRevivalItemBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LRevivalItemBehavior);
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
