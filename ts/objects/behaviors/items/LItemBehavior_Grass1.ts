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
        const self = args.self;
        const item = this.ownerEntity().getBehavior(LItemBehavior);
        const itemData = item.itemData();
        const target = args.sender;
        const effectContext = new REEffectContext(self, itemData.scope, itemData.effect);

        context.postAnimation(args.sender, itemData.animationId, true);

        context.postCall(() => {
            const result = effectContext.apply(target);
            result.showResultMessages(context, target);
        });

        // 食べられたので削除。
        // [かじる] も [食べる] の一部として考えるような場合は Entity が削除されることは無いので、
        // actor 側で destroy するのは望ましくない。
        self.destroy();

        return REResponse.Succeeded;
    }
}

