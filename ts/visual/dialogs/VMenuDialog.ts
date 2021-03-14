
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/objects/LEntity";
import { VMenuCommandWindow } from "../windows/VMenuCommandWindow";
import { VItemListDialog } from "./VItemListDialog";
import { VSubDialog } from "./VSubDialog";

export class VMenuDialog extends VSubDialog {
    _entity: LEntity;
    _commandWindow: VMenuCommandWindow | undefined;

    constructor(entity: LEntity) {
        super();
        this._entity = entity;
    }
    
    onCreate() {
        const y = 100;
        const cw = 200;
        this._commandWindow = new VMenuCommandWindow(new Rectangle(0, y, cw, 200));
        this.addWindow(this._commandWindow);

        this._commandWindow.setHandler("item", this.commandItem.bind(this));
        this._commandWindow.setHandler("cancel", () => this.cancel());
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

