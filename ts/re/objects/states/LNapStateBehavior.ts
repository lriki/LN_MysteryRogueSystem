import { REBasics } from "ts/re/data/REBasics";
import { DEventId, RoomEventArgs, SkillEmittedArgs, WalkEventArgs } from "ts/re/data/predefineds/DBasicEvents";
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
import { LEntityId } from "../LObject";
import { UMovement } from "ts/re/usecases/UMovement";

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
        REGame.eventServer.subscribe(REBasics.events.walked, this);
        REGame.eventServer.subscribe(REBasics.events.skillEmitted, this);
    }

    onDetached(self: LEntity): void {
        REGame.eventServer.unsubscribe(REBasics.events.roomEnterd, this);
        REGame.eventServer.unsubscribe(REBasics.events.walked, this);
        REGame.eventServer.unsubscribe(REBasics.events.skillEmitted, this);
    }

    onEvent(cctx: SCommandContext, eventId: DEventId, args: any): LEventResult {
        const self = this.ownerEntity();

        // handleRoomEnterd
        if (eventId == REBasics.events.roomEnterd) {
            const e = (args as RoomEventArgs);
            const block = REGame.map.block(self.x, self.y);
            if (block._roomId == e.newRoomId) {
                this.attemptReserveGetUp(self, e.entity);
            }
        }
        else if (eventId == REBasics.events.walked) {
            const e = (args as WalkEventArgs);
            if (UMovement.checkAdjacentEntities(self, e.walker)) {
                this.attemptReserveGetUp(self, e.walker);
            }
        }
        else if (eventId == REBasics.events.skillEmitted) {
            const e = (args as SkillEmittedArgs);
            const block = REGame.map.block(self.x, self.y);
            if (block._roomId == e.performer.roomId()) {
                this.attemptReserveGetUp(self, e.performer);
            }
        }
        return LEventResult.Pass;
    }

    private attemptReserveGetUp(self: LEntity, target: LEntity) {
        if (Helpers.isHostile(target, self)) {
            this._hostileEnterd = true;
        }
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
