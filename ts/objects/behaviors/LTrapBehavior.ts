import { assert, tr } from "ts/Common";
import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { DItem, DItemDataId } from "ts/data/DItem";
import { REData } from "ts/data/REData";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { REEffectContext } from "ts/system/REEffectContext";
import { RESystem } from "ts/system/RESystem";
import { REGame } from "../REGame";
import { REGame_Block } from "../REGame_Block";
import { REGame_Entity } from "../REGame_Entity";
import { CommandArgs, LBehavior, onWalkedOnTopReaction } from "./LBehavior";
import { LItemBehavior } from "./LItemBehavior";


/**
 */
export class LTrapBehavior extends LBehavior {

    constructor() {
        super();
    }

    public trapName(): string {
        const itemId = REGame.world.entity(this._ownerEntityId).queryProperty(RESystem.properties.itemId) as number;
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
    
    [onWalkedOnTopReaction](e: CommandArgs, context: RECommandContext): REResponse {
        console.log("onWalkedOnTopReaction", e);


        context.postMessage(tr("{0} を踏んだ！", this.trapName()));


        const trapItem = this.ownerEntity().getBehavior(LItemBehavior);
        const itemData = trapItem.itemData();

        const target = e.sender;
        const effectContext = new REEffectContext(e.self, itemData.scope, itemData.effect, target);

        const result = effectContext.apply(entity);


        context.postAnimation(e.sender, 35, true);
        context.postMessage(tr("しかし ワナには かからなかった。"));
        
        return REResponse.Pass;
    }
}

