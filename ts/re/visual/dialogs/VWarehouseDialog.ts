import { SWarehouseDialog } from "ts/re/system/dialogs/SWarehouseDialog";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { VWarehouseMenuCommandWindow } from "../windows/VWarehouseMenuCommandWindow";
import { SWarehouseStoreDialog } from "ts/re/system/dialogs/SWarehouseStoreDialog";
import { SWarehouseWithdrawDialog } from "ts/re/system/dialogs/SWarehouseWithdrawDialog";
import { VDialog } from "./VDialog";
import { SDialog } from "ts/re/system/SDialog";

export class VWarehouseDialog extends VDialog {
    private _model: SWarehouseDialog;
    private _commandWindow: VWarehouseMenuCommandWindow;

    constructor(model: SWarehouseDialog) {
        super(model);
        this._model = model;
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
        const inventory = user.getEntityBehavior(LInventoryBehavior);
        this.openSubDialog(new SWarehouseStoreDialog(user, inventory), (result: SWarehouseStoreDialog) => {
            this._model.storeItems(result.resultItems());
        });

    }

    private handleWithdrawCommand() {

        const user = this._model.userEntity();
        const inventory = this._model.warehouseEntity().getEntityBehavior(LInventoryBehavior);
        this.openSubDialog(new SWarehouseWithdrawDialog(user, inventory), (result: SWarehouseWithdrawDialog) => {
            this._model.withdrawItems(result.resultItems());
        });
    }
    
    private handleCancelCommand() {
        this._model.cancel();
    }
}

