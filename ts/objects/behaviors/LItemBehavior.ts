import { DItem, DItemDataId } from "ts/data/DItem";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { RESystem } from "ts/system/RESystem";
import { REGame_Entity } from "../REGame_Entity";
import { LBehavior } from "./LBehavior";


/**
 * Item として表現する Entity の共通 Behavior
 */
export class LItemBehavior extends LBehavior {

    private _itemId: DItemDataId;

    constructor(itemId: DItemDataId) {
        super();
        this._itemId = itemId;
    }

    onQueryProperty(propertyId: number): any {
        if (propertyId == RESystem.properties.itemId)
            return this._itemId;
        else
            super.onQueryProperty(propertyId);
    }
}

