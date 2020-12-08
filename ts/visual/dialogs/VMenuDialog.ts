
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { REDialogVisualWindowLayer } from "../REDialogVisual";
import { VMenuCommandWindow } from "../windows/VMenuCommandWindow";
import { VItemListDialog } from "./VItemListDialog";

export class VMenuDialog extends REDialogVisualWindowLayer {
    _entity: REGame_Entity;
    _commandWindow: VMenuCommandWindow | undefined;

    constructor(entity: REGame_Entity) {
        super();
        this._entity = entity;
    }
    
    onCreate() {
        const y = 100;
        const cw = 200;
        this._commandWindow = new VMenuCommandWindow(new Rectangle(0, y, cw, 200));
        this.addWindow(this._commandWindow);

        this._commandWindow.setHandler("item", this.commandItem.bind(this));
        this._commandWindow.setHandler("cancel", () => this.pop());
    }
    
    onStart() {
        this._commandWindow?.activate();
    }


    commandItem() {
        const inventory = this._entity.findBehavior(LInventoryBehavior);
        if (inventory) {
            this.push(new VItemListDialog(this._entity, inventory));
        }
    }
}

