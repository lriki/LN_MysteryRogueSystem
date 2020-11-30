import { assert } from "ts/Common";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { REDialogVisualWindowLayer } from "../REDialogVisual";
import { VItemListWindow } from "../windows/VItemListWindow";

export class VItemListDialog extends REDialogVisualWindowLayer {
    _entity: REGame_Entity;
    _inventory: LInventoryBehavior;
    _itemListWindow: VItemListWindow | undefined;

    constructor(entity: REGame_Entity, inventory: LInventoryBehavior) {
        super();
        this._entity = entity;
        this._inventory = inventory;
    }
    
    onCreate() {
        const y = 100;
        const cw = 200;

        this._itemListWindow = new VItemListWindow(this._inventory, new Rectangle(0, y, Graphics.boxWidth - cw, 400));
        this.addWindow(this._itemListWindow);


    }

}
