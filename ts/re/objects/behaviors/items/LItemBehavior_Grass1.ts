import { DActionId } from "ts/re/data/DAction";
import { DBasics } from "ts/re/data/DBasics";
import { LEntity } from "ts/re/objects/LEntity";
import { LBehavior } from "../LBehavior";
import { REGame } from "ts/re/objects/REGame";

/**
 * @deprecated see kItem_スピードドラッグ
 */
export class LItemBehavior_Grass1 extends LBehavior {
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LItemBehavior_Grass1);
        return b;
    }

    onQueryReactions(actions: DActionId[]): void {
        actions.push(DBasics.actions.EatActionId);
    }
    


}

