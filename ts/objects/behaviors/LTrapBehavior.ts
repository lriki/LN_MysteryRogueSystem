import { DBasics } from "ts/data/DBasics";
import { DItem, DItemDataId } from "ts/data/DItem";
import { ActionId, REData } from "ts/data/REData";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { RESystem } from "ts/system/RESystem";
import { REGame } from "../REGame";
import { REGame_Entity } from "../REGame_Entity";
import { LBehavior } from "./LBehavior";


/**
 */
export class LTrapBehavior extends LBehavior {


    constructor() {
        super();
    }
    
    onQueryActions(actions: ActionId[]): ActionId[] {
        const result = actions.filter(x => x != DBasics.actions.PickActionId);
        return result;
    }
}

