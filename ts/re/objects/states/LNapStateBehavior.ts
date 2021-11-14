import { REBasics } from "ts/re/data/REBasics";
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
import { LActionTokenType } from "../LActionToken";
import { RESerializable } from "ts/re/Common";

@RESerializable
export class LNapStateBehavior extends LBehavior {
    private _hostileEnterd: boolean = false;
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LNapStateBehavior);
        b._hostileEnterd = this._hostileEnterd;
        return b
    }

    onAttached(self: LEntity): void {
        REGame.eventServer.subscribe(REBasics.events.roomEnterd, this);
    }

    onDetached(self: LEntity): void {
        REGame.eventServer.unsubscribe(REBasics.events.roomEnterd, this);
    }

    onEvent(cctx: SCommandContext, eventId: DEventId, args: any): LEventResult {
        // handleRoomEnterd
        if (eventId == REBasics.events.roomEnterd) {
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

    onQueryIdleSequelId(): DSequelId | undefined {
        return REBasics.sequels.asleep;
    }
    
    onDecisionPhase(self: LEntity, cctx: SCommandContext, phase: DecisionPhase): SPhaseResult {
        if (phase == DecisionPhase.UpdateState) {
            return SPhaseResult.Pass;
        }
        else if (phase == DecisionPhase.ResolveAdjacentAndMovingTarget) {
            if (this._hostileEnterd) {
                const r = cctx.random().nextIntWithMax(100);
                if (r < 50) {   // 50%
                    //this.removeThisState();
                    this.parentAs(LState)?.removeThisState();
                }
                this._hostileEnterd = false;
            }

            return SPhaseResult.Pass;
        }
        else {
            // Skip action
            cctx.postConsumeActionToken(self, LActionTokenType.Major);
            return SPhaseResult.Handled;
        }
    }
}
