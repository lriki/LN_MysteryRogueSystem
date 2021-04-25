import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { CommandArgs, LBehavior, onEatReaction } from "../LBehavior";

/**
 * 
 */
export class LEatableBehavior extends LBehavior {

    
    onQueryReactions(actions: DActionId[]): DActionId[] {
        actions.push(DBasics.actions.EatActionId);
        return actions;
    }

    
    [onEatReaction](args: CommandArgs, context: SCommandContext): REResponse {
        const actor = args.sender;

        console.log("eat reaction");

        return REResponse.Succeeded;
    }
}

