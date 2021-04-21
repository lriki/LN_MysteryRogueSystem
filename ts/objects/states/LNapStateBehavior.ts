import { DBasics } from "ts/data/DBasics";
import { DEventId, RoomEventArgs } from "ts/data/predefineds/DBasicEvents";
import { Helpers } from "ts/system/Helpers";
import { REResponse, SPhaseResult } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { RESystem } from "ts/system/RESystem";
import { DecisionPhase } from "../behaviors/LBehavior";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { LStateTraitBehavior } from "./LStateTraitBehavior";

export class LNapStateBehavior extends LStateTraitBehavior {
    private _hostileEnterd: boolean = false;
    
    onAttached(): void {
        REGame.eventServer.subscribe(DBasics.events.roomEnterd, this);
    }

    onDetached(): void {

    }

    onEvent(eventId: DEventId, args: any): void {
        // handleRoomEnterd
        if (eventId == DBasics.events.roomEnterd) {
            const entity = this.ownerEntity();
            const block = REGame.map.block(entity.x, entity.y);
            const roomId = block._roomId;

            const e = (args as RoomEventArgs);
            if (Helpers.isHostile(e.entity, entity) && e.newRoomId == roomId) {
                this._hostileEnterd = true;
            }
        }
    }

    onQueryProperty(propertyId: number): any {
        if (propertyId == RESystem.properties.idleSequel)
            return RESystem.sequels.asleep;
        else
            return super.onQueryProperty(propertyId);
    }
    
    onDecisionPhase(entity: LEntity, context: SCommandContext, phase: DecisionPhase): SPhaseResult {
        if (phase == DecisionPhase.ResolveAdjacentAndMovingTarget) {
            if (this._hostileEnterd) {
                this.removeThisState();
            }
            this._hostileEnterd = false;

            return SPhaseResult.Pass;
        }
        else {
            // Skip action
            context.postConsumeActionToken(entity);
            return SPhaseResult.Handled;
        }
    }
}
