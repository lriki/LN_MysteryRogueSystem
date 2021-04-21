import { REResponse, SPhaseResult } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { RESystem } from "ts/system/RESystem";
import { DecisionPhase } from "../behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { LStateTraitBehavior } from "./LStateTraitBehavior";

export class LGenericRMMZStateBehavior extends LStateTraitBehavior {
    
    onAttached(): void {
        //console.log("LStateTrait_GenericRMMZState");
        //REGame.eventServer.subscribe(DBasics.events.roomEnterd, this);
    }

    onDetached(): void {

    }

    onQueryProperty(propertyId: number): any {
        //console.log("LStateTrait_GenericRMMZState onQueryProperty");
        //throw new Error("LStateTrait_Nap onQueryProperty");

        if (propertyId == RESystem.properties.idleSequel)
            return RESystem.sequels.asleep;
        else
            return super.onQueryProperty(propertyId);
    }
    
    onDecisionPhase(entity: LEntity, context: SCommandContext, phase: DecisionPhase): SPhaseResult {
        if (phase == DecisionPhase.Prepare) {
            //console.log("DecisionPhase.Prepare");
            // TEST: 行動スキップ
            //context.postSkipPart(entity);
            return SPhaseResult.Handled;
        }
        else {
            return SPhaseResult.Handled;
        }
    }
}
