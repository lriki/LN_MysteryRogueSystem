import { DBasics } from "ts/data/DBasics";
import { DEventId, RoomEventArgs } from "ts/data/predefineds/DBasicEvents";
import { REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { RESystem } from "ts/system/RESystem";
import { DecisionPhase } from "../behaviors/LBehavior";
import { REGame } from "../REGame";
import { REGame_Entity } from "../REGame_Entity";
import { LStateTraitBehavior } from "./LStateTraitBehavior";

export class LStateTrait_Nap extends LStateTraitBehavior {
    
    onAttached(): void {
        REGame.eventServer.subscribe(DBasics.events.roomEnterd, this);
    }

    onDetached(): void {

    }

    onEvent(eventId: DEventId, args: any): void {
        // handleRoomEnterd
        {
            console.log("!!!! onEvent !!", eventId, args);
        }
    }

    onQueryProperty(propertyId: number): any {
        if (propertyId == RESystem.properties.idleSequel)
            return RESystem.sequels.asleep;
        else
            super.onQueryProperty(propertyId);
    }
    
    onDecisionPhase(entity: REGame_Entity, context: RECommandContext, phase: DecisionPhase): REResponse {
        // Skip action
        context.postConsumeActionToken(entity);
        return REResponse.Succeeded;
    }
}
