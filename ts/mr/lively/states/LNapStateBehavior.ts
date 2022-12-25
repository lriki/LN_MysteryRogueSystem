import { MRBasics } from "ts/mr/data/MRBasics";
import { DEventId, RoomEventArgs, SkillEmittedArgs, WalkEventArgs } from "ts/mr/data/predefineds/DBasicEvents";
import { Helpers } from "ts/mr/system/Helpers";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { DecisionPhase, LBehavior } from "../behaviors/LBehavior";
import { MRLively } from "../MRLively";
import { LEntity } from "../LEntity";
import { LState } from "./LState";
import { LEventResult } from "../LEventServer";
import { DSequelId } from "ts/mr/data/DSequel";
import { MRSerializable } from "ts/mr/Common";
import { UMovement } from "ts/mr/utility/UMovement";

enum GetUpReserved {
    None,
    Random,
    Certainly,
}
@MRSerializable
export class LNapStateBehavior extends LBehavior {
    private _getUpReserved: GetUpReserved = GetUpReserved.None;
    
    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LNapStateBehavior);
        b._getUpReserved = this._getUpReserved;
        return b
    }

    onAttached(self: LEntity): void {
        MRLively.eventServer.subscribe(MRBasics.events.roomEnterd, this);
        MRLively.eventServer.subscribe(MRBasics.events.walked, this);
        MRLively.eventServer.subscribe(MRBasics.events.skillEmitted, this);
    }

    onDetached(self: LEntity): void {
        MRLively.eventServer.unsubscribe(MRBasics.events.roomEnterd, this);
        MRLively.eventServer.unsubscribe(MRBasics.events.walked, this);
        MRLively.eventServer.unsubscribe(MRBasics.events.skillEmitted, this);
    }

    onEvent(cctx: SCommandContext, eventId: DEventId, args: any): LEventResult {
        const self = this.ownerEntity();

        // handleRoomEnterd
        if (eventId == MRBasics.events.roomEnterd) {
            const e = (args as RoomEventArgs);
            const block = MRLively.mapView.currentMap.block(self.mx, self.my);
            if (block._roomId == e.newRoomId) {
                this.attemptReserveGetUp(self, e.entity);
            }
        }
        else if (eventId == MRBasics.events.walked) {
            const e = (args as WalkEventArgs);
            if (UMovement.checkAdjacentEntities(self, e.walker)) {
                this.attemptReserveGetUp(self, e.walker);
            }
        }
        else if (eventId == MRBasics.events.skillEmitted) {
            const e = (args as SkillEmittedArgs);
            const block = MRLively.mapView.currentMap.block(self.mx, self.my);
            if (block._roomId == e.performer.roomId()) {
                this.attemptReserveGetUp(self, e.performer);
            }
        }
        return LEventResult.Pass;
    }

    private attemptReserveGetUp(self: LEntity, target: LEntity) {
        // 起きるの確定済みなので判定不要
        if (this._getUpReserved == GetUpReserved.Certainly) return;

        // 忍び足の場合は起きる判定を発生させない
        const traits = target.allTraits();
        if (traits.find(t => t.code == MRBasics.traits.SilentStep)) return;

        if (Helpers.isHostile(target, self)) {
            if (traits.find(t => t.code == MRBasics.traits.AwakeStep)) {
                this._getUpReserved = GetUpReserved.Certainly;
            }
            else {
                this._getUpReserved = GetUpReserved.Random;
            }
        }
    }

    onQueryIdleSequelId(): DSequelId {
        return MRBasics.sequels.asleep;
    }
    
    onDecisionPhase(self: LEntity, cctx: SCommandContext, phase: DecisionPhase): SPhaseResult {
        // if (phase == DecisionPhase.UpdateState) {
        //     return SPhaseResult.Pass;
        // }
        // else
        if (phase == DecisionPhase.ResolveAdjacentAndMovingTarget) {
            if (this._getUpReserved == GetUpReserved.Certainly) {
                this.parentAs(LState)?.removeThisState();
            }
            else if (this._getUpReserved == GetUpReserved.Random) {
                const r = cctx.random().nextIntWithMax(100);
                if (r < 50) {   // 50%
                    this.parentAs(LState)?.removeThisState();
                }
            }
            this._getUpReserved = GetUpReserved.None;

            return SPhaseResult.Pass;
        }
        // else if (phase == DecisionPhase.Manual ||
        //     phase == DecisionPhase.AIMinor ||
        //     phase == DecisionPhase.AIMajor) {
        //     // Skip action
        //     cctx.postConsumeActionToken(self, LActionTokenType.Major);
        //     return SPhaseResult.Handled;
        // }

        return SPhaseResult.Pass;
    }
}
