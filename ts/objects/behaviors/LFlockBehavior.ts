import { DBasics } from "ts/data/DBasics";
import { DEventId } from "ts/data/predefineds/DBasicEvents";
import { REData } from "ts/data/REData";
import { LBehavior } from "../internal";
import { LEntity } from "../LEntity";
import { LEventResult } from "../LEventServer";
import { REGame } from "../REGame";


export class LFlockBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LFlockBehavior);
        return b
    }
    
    onAttached(): void {
    }

    onDetached(): void {
    }

    onPertyChanged(self: LEntity): void {
        if (self.partyId() > 0) {
            console.log("onPertyChanged");
            REGame.world.party(self.partyId()).subscribe(DBasics.events.effectReacted, this);
        }
    }
    
    onPartyEvent(eventId: DEventId, args: any): LEventResult {
        console.log("onPartyEvent");
        if (eventId == DBasics.events.effectReacted) {
            this.ownerEntity().removeState(REData.getStateFuzzy("kState_仮眠2").id);
        }
        return LEventResult.Pass;
    }
}

