
import { tr } from "ts/Common";
import { LWarehouseDialog } from "ts/dialogs/LWarehouseDialog";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { RESystem } from "ts/system/RESystem";
import { REDialogVisualWindowLayer } from "../REDialogVisual";
import { VMenuCommandWindow } from "../windows/VMenuCommandWindow";
import { VWarehouseMenuCommandWindow } from "../windows/VWarehouseMenuCommandWindow";
import { VItemListDialog } from "./VItemListDialog";
import { VWarehouseStoreDialog } from "./VWarehouseStoreDialog";

export class VWarehouseDialog extends REDialogVisualWindowLayer {
    private _model: LWarehouseDialog;
    private _inventory: LInventoryBehavior;
    private _commandWindow: VWarehouseMenuCommandWindow;

    constructor(model: LWarehouseDialog) {
        super();
        this._model = model;
        this._inventory = this._model.userEntity().getBehavior(LInventoryBehavior);
        
        const y = 100;
        const cw = 200;
        this._commandWindow = new VWarehouseMenuCommandWindow(new Rectangle(0, y, cw, 200));
        this._commandWindow.setHandler("store", () => this.handleStoreCommand());
        this._commandWindow.setHandler("withdraw", () => this.handleWithdrawCommand());
        this._commandWindow.setHandler("cancel", () => this.handleCancelCommand());
    }
    
    onCreate() {
        this.addWindow(this._commandWindow);
    }
    
    onStart() {
        this._commandWindow?.activate();
    }

    private handleStoreCommand() {
        const user = this._model.userEntity();
        const inventory = user.getBehavior(LInventoryBehavior);
        this.push(new VWarehouseStoreDialog(user, inventory));

        console.log("handleStoreCommand");
    }

    private handleWithdrawCommand() {
        console.log("handleWithdrawCommand");
    }
    
    private handleCancelCommand() {
        this.pop();
        RESystem.dialogContext.closeDialog(true);
    }
}

