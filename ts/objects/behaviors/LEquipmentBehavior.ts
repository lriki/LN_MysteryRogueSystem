import { assert } from "ts/Common";
import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { LBehavior } from "./LBehavior";
import { LItemBehavior } from "./LItemBehavior";


export class LEquipmentBehavior extends LBehavior {

    
    onAttached(): void {
        assert( this.ownerEntity().hasBehavior(LItemBehavior));
    }
    
    onQueryReactions(actions: DActionId[]): DActionId[] {
        actions.push(DBasics.actions.EquipActionId);
        actions.push(DBasics.actions.EquipOffActionId);
        return actions;
    }
}
