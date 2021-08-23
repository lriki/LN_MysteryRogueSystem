import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { LEntity } from "ts/objects/LEntity";
import { REGame } from "ts/objects/REGame";
import { REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { CommandArgs, LBehavior, onEatReaction } from "../LBehavior";

/**
 * @deprecated kItem_スピードドラッグ
 */
export class LEatableBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LEatableBehavior);
        return b
    }

    onQueryReactions(actions: DActionId[]): void {
        actions.push(DBasics.actions.EatActionId);
    }

    
    [onEatReaction](args: CommandArgs, context: SCommandContext): REResponse {
        const actor = args.sender;

        console.log("eat reaction");

        return REResponse.Succeeded;
    }
}

