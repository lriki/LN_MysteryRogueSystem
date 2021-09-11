import { DBasics } from "ts/re/data/DBasics";
import { DEventId } from "ts/re/data/predefineds/DBasicEvents";
import { REData } from "ts/re/data/REData";
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
            REGame.world.party(self.partyId()).subscribe(DBasics.events.effectReacted, this);
        }
    }
    
    onPartyEvent(eventId: DEventId, args: any): LEventResult {
        if (eventId == DBasics.events.effectReacted) {
            this.ownerEntity().removeState(REData.getStateFuzzy("kState_仮眠2").id);
        }
        return LEventResult.Pass;
    }
}

