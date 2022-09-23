import { MRSerializable } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import { DEventId } from "ts/mr/data/predefineds/DBasicEvents";
import { MRData } from "ts/mr/data/MRData";
import { LBehavior } from "../internal";
import { LEntity } from "../LEntity";
import { LEventResult } from "../LEventServer";
import { REGame } from "../REGame";


@MRSerializable
export class LFlockBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LFlockBehavior);
        return b;
    }
    
    onAttached(self: LEntity): void {
    }

    onDetached(self: LEntity): void {
    }

    onPertyChanged(self: LEntity): void {
        if (self.partyId() > 0) {
            REGame.world.party(self.partyId()).subscribe(MRBasics.events.effectReacted, this);
        }
    }
    
    onPartyEvent(eventId: DEventId, args: any): LEventResult {
        if (eventId == MRBasics.events.effectReacted) {
            this.ownerEntity().removeState(MRData.getState("kState_仮眠2").id);
        }
        return LEventResult.Pass;
    }
}

