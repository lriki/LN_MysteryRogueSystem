import { tr } from "ts/Common";
import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { DItem, DItemDataId } from "ts/data/DItem";
import { REData } from "ts/data/REData";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { RESystem } from "ts/system/RESystem";
import { REGame } from "../REGame";
import { REGame_Block } from "../REGame_Block";
import { REGame_Entity } from "../REGame_Entity";
import { CommandArgs, LBehavior, onWalkedOnTopReaction } from "./LBehavior";


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
    
    [onWalkedOnTopReaction](e: CommandArgs, context: RECommandContext): REResponse {
        context.postMessage(tr("{0} を踏んだ！", this.trapName()));
        context.postMessage(tr("しかし ワナには かからなかった。"));
        
        return REResponse.Pass;
    }
}

