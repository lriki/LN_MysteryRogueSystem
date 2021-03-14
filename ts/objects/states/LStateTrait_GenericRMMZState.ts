import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DEventId, RoomEventArgs } from "ts/data/predefineds/DBasicEvents";
import { REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { REGameManager } from "ts/system/REGameManager";
import { RESystem } from "ts/system/RESystem";
import { LUnitAttribute } from "../attributes/LUnitAttribute";
import { DecisionPhase } from "../behaviors/LBehavior";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { LStateTraitBehavior } from "./LStateTraitBehavior";

export class LStateTrait_GenericRMMZState extends LStateTraitBehavior {
    
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
    
    onDecisionPhase(entity: LEntity, context: RECommandContext, phase: DecisionPhase): REResponse {
        if (phase == DecisionPhase.Prepare) {
            //console.log("DecisionPhase.Prepare");
            // TEST: 行動スキップ
            //context.postSkipPart(entity);
            return REResponse.Succeeded;
        }
        else {
            return REResponse.Succeeded;
        }
    }
}
