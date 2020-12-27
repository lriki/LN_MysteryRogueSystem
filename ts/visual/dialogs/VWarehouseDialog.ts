
import { tr } from "ts/Common";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { REDialogVisualWindowLayer } from "../REDialogVisual";
import { VMenuCommandWindow } from "../windows/VMenuCommandWindow";
import { VItemListDialog } from "./VItemListDialog";

export class VWarehouseDialog extends REDialogVisualWindowLayer {
    private _entity: REGame_Entity;
    private _inventory: LInventoryBehavior;
    private _commandWindow: VMenuCommandWindow | undefined;

    constructor(entity: REGame_Entity) {
        super();
        this._entity = entity;
        this._inventory = this._entity.getBehavior(LInventoryBehavior);
    }
    
    onCreate() {
        const y = 100;
        const cw = 200;
        this._commandWindow = new VMenuCommandWindow(new Rectangle(0, y, cw, 200));
        this.addWindow(this._commandWindow);

        this._commandWindow.setHandler(tr("あずける"), () => this.handleStoreCommand());
        this._commandWindow.setHandler(tr("ひきだす"), () => this.handleWithdrawCommand());
        this._commandWindow.setHandler(tr("キャンセル"), () => this.pop());
    }
    
    onStart() {
        this._commandWindow?.activate();
    }

    private handleStoreCommand() {
        console.log("handleStoreCommand");
    }

    private handleWithdrawCommand() {
        console.log("handleWithdrawCommand");
    }
}

