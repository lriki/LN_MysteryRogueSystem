import { DItem, DItemDataId } from "ts/data/DItem";
import { REData } from "ts/data/REData";
import { RESystem } from "ts/system/RESystem";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { LBehavior } from "./LBehavior";


/**
 * Item として表現する Entity の共通 Behavior
 */
export class LItemBehavior extends LBehavior {

    private _itemId: DItemDataId = 0;

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LItemBehavior);
        b._itemId = this._itemId;
        return b
    }

    public constructor() {
        super();
    }

    public setup(itemId: DItemDataId): void {
        this._itemId = itemId;
    }

    public itemDataId(): DItemDataId {
        return this._itemId;
    }

    public itemData(): DItem {
        return REData.itemData(this._itemId);
    }

    onQueryProperty(propertyId: number): any {
        if (propertyId == RESystem.properties.itemId)
            return this._itemId;
        else
            super.onQueryProperty(propertyId);
    }

}

