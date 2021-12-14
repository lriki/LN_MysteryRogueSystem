import { RESerializable } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { DEventId } from "ts/re/data/predefineds/DBasicEvents";
import { REData } from "ts/re/data/REData";
import { LBehavior } from "../internal";
import { LEntity } from "../LEntity";
import { LEventResult } from "../LEventServer";
import { REGame } from "../REGame";


@RESerializable
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
            REGame.world.party(self.partyId()).subscribe(REBasics.events.effectReacted, this);
        }
    }
    
    onPartyEvent(eventId: DEventId, args: any): LEventResult {
        if (eventId == REBasics.events.effectReacted) {
            this.ownerEntity().removeState(REData.getState("kState_仮眠2").id);
        }
        return LEventResult.Pass;
    }
}

