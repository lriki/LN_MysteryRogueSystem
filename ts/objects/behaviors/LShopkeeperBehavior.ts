import { SManualActionDialog } from "ts/system/dialogs/SManualDecisionDialog";
import { SPhaseResult } from "../../system/RECommand";
import { SCommandContext } from "../../system/SCommandContext";
import { DecisionPhase, LBehavior } from "./LBehavior";
import { LEntity } from "ts/objects/LEntity";
import { REGame } from "ts/objects/REGame";
import { LUnitBehavior } from "./LUnitBehavior";
import { UMovement } from "ts/usecases/UMovement";
import { LCharacterAI } from "../LCharacterAI";
import { LActivity } from "../activities/LActivity";

/**
 */
export class LShopkeeperBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LShopkeeperBehavior);
        return b;
    }


}
