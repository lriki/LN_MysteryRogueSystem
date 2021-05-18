import { DBasics } from "ts/data/DBasics";
import { SPhaseResult } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { LEntity } from "../LEntity";
import { LBattlerBehavior } from "./LBattlerBehavior";
import { DecisionPhase, LBehavior } from "./LBehavior";

/**
 * 
 */
export class LSurvivorBehavior extends LBehavior {

    onAttached(): void {
        //const battler = this.ownerEntity().getBehavior(LBattlerBehavior);
        //battler.setupExParam(DBasics.params.fp);
    }

    onDecisionPhase(entity: LEntity, context: SCommandContext, phase: DecisionPhase): SPhaseResult {
        
        if (phase == DecisionPhase.UpdateState) {

            const battler = this.ownerEntity().getBehavior(LBattlerBehavior);
            battler.gainActualParam(DBasics.params.fp, -1);





            return SPhaseResult.Pass;
        }
        else {
            return SPhaseResult.Pass;
        }
    }
}
