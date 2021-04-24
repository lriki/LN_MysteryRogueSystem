import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { LBehavior } from "../LBehavior";

/**
 * 
 */
export class LEatableBehavior extends LBehavior {

    
    onQueryReactions(actions: DActionId[]): DActionId[] {
        actions.push(DBasics.actions.EatActionId);
        return actions;
    }

}

