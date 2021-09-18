import { DBasics } from "ts/re/data/DBasics";
import { DEventId, RoomEventArgs } from "ts/re/data/predefineds/DBasicEvents";
import { Helpers } from "ts/re/system/Helpers";
import { SPhaseResult } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { RESystem } from "ts/re/system/RESystem";
import { DecisionPhase, LBehavior } from "../behaviors/LBehavior";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { LState } from "./LState";
import { LEventResult } from "../LEventServer";
import { DSequelId } from "ts/re/data/DSequel";

export class LNapStateBehavior extends LBehavior {
    private _hostileEnterd: boolean = false;
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LNapStateBehavior);
        b._hostileEnterd = this._hostileEnterd;
        return b
    }

    onAttached(self: LEntity): void {
        REGame.eventServer.subscribe(DBasics.events.roomEnterd, this);
    }

    onDetached(self: LEntity): void {
        REGame.eventServer.unsubscribe(DBasics.events.roomEnterd, this);
    }

    onEvent(context: SCommandContext, eventId: DEventId, args: any): LEventResult {
        // handleRoomEnterd
        if (eventId == DBasics.events.roomEnterd) {
            const e = (args as RoomEventArgs);
            const entity = this.ownerEntity();
            const block = REGame.map.block(entity.x, entity.y);
            const roomId = block._roomId;

            if (Helpers.isHostile(e.entity, entity) && e.newRoomId == roomId) {
                this._hostileEnterd = true;
            }
        }
        return LEventResult.Pass;
    }

    queryIdleSequelId(): DSequelId | undefined {
        return RESystem.sequels.asleep;
    }
    
    onDecisionPhase(entity: LEntity, context: SCommandContext, phase: DecisionPhase): SPhaseResult {
        if (phase == DecisionPhase.UpdateState) {
            return SPhaseResult.Pass;
        }
        else if (phase == DecisionPhase.ResolveAdjacentAndMovingTarget) {
            if (this._hostileEnterd) {
                //this.removeThisState();
                this.parentAs(LState)?.removeThisState();
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
