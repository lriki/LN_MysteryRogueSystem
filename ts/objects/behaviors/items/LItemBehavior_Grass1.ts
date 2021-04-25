import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { REResponse } from "ts/system/RECommand";
import { REEffectContext } from "ts/system/REEffectContext";
import { SCommandContext } from "ts/system/SCommandContext";
import { CommandArgs, LBehavior, onEatReaction } from "../LBehavior";
import { LItemBehavior } from "../LItemBehavior";

/**
 * 
 */
export class LItemBehavior_Grass1 extends LBehavior {

    
    onQueryReactions(actions: DActionId[]): DActionId[] {
        actions.push(DBasics.actions.EatActionId);
        return actions;
    }

    
    [onEatReaction](args: CommandArgs, context: SCommandContext): REResponse {
        const actor = args.sender;

        console.log("eat reaction", args);

        const item = this.ownerEntity().getBehavior(LItemBehavior);
        const itemData = item.itemData();

        const target = args.sender;
        const effectContext = new REEffectContext(args.self, itemData.scope, itemData.effect);


        context.postCall(() => {
            context.postAnimation(args.sender, itemData.animationId, true);
            const result = effectContext.apply(target);
            console.log("result", result);
            result.showResultMessages(context, target);
        });

        return REResponse.Succeeded;
    }
}

