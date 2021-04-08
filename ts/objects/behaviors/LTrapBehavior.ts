import { assert, tr } from "ts/Common";
import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { REData } from "ts/data/REData";
import { RECommand, REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { REEffectContext } from "ts/system/REEffectContext";
import { RESystem } from "ts/system/RESystem";
import { CommandArgs, LBehavior, onWalkedOnTopReaction } from "./LBehavior";
import { LItemBehavior } from "./LItemBehavior";


/**
 */
export class LTrapBehavior extends LBehavior {

    constructor() {
        super();
    }

    public trapName(): string {
        const itemId = this.ownerEntity().queryProperty(RESystem.properties.itemId) as number;
        const item = REData.items[itemId];
        return item.name;
    }
    
    onQueryActions(actions: DActionId[]): DActionId[] {
        const result = actions.filter(x => x != DBasics.actions.PickActionId);
        return result;
    }

    onAttached(): void {
        assert(this.ownerEntity().findBehavior(LItemBehavior));
    }
    
    [onWalkedOnTopReaction](e: CommandArgs, context: SCommandContext): REResponse {


        context.postMessage(tr("{0} を踏んだ！", this.trapName()));


        const trapItem = this.ownerEntity().getBehavior(LItemBehavior);
        const itemData = trapItem.itemData();

        const target = e.sender;
        const effectContext = new REEffectContext(e.self, itemData.scope, itemData.effect);




        //console.log(result);


        context.postAnimation(e.sender, 35, true);

        // TODO: ここでラムダ式も post して apply したい。

        context.postCall(() => {
            const result = effectContext.apply(target);
            result.showResultMessages(context, target);
        });



        //context.postMessage(tr("しかし ワナには かからなかった。"));
        
        return REResponse.Pass;
    }
}

