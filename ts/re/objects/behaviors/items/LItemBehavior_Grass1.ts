import { DActionId } from "ts/re/data/DAction";
import { REBasics } from "ts/re/data/REBasics";
import { LEntity } from "ts/re/objects/LEntity";
import { LBehavior } from "../LBehavior";
import { REGame } from "ts/re/objects/REGame";
import { RESerializable } from "ts/re/Common";

/**
 * @deprecated see kItem_スピードドラッグ
 */
@RESerializable
export class LItemBehavior_Grass1 extends LBehavior {
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LItemBehavior_Grass1);
        return b;
    }

    onQueryReactions(actions: DActionId[]): void {
        actions.push(REBasics.actions.EatActionId);
    }
    


}

