import { SWarehouseDialog } from "ts/system/dialogs/SWarehouseDialog";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/objects/LEntity";
import { VWarehouseMenuCommandWindow } from "../windows/VWarehouseMenuCommandWindow";
import { SWarehouseStoreDialog } from "ts/system/dialogs/SWarehouseStoreDialog";
import { SWarehouseWithdrawDialog } from "ts/system/dialogs/SWarehouseWithdrawDialog";
import { VDialog } from "./VDialog";

export class VWarehouseDialog extends VDialog {
    private _model: SWarehouseDialog;
    //private _inventory: LInventoryBehavior;
    private _commandWindow: VWarehouseMenuCommandWindow;

    constructor(model: SWarehouseDialog) {
        super(model);
        this._model = model;
        //this._inventory = this._model.userEntity().getBehavior(LInventoryBehavior);
        
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
        this.openSubDialog(new SWarehouseStoreDialog(user, inventory), (result: any) => {
            this._model.storeItems(result as LEntity[]);
        });

    }

    private handleWithdrawCommand() {

        const user = this._model.userEntity();
        const inventory = this._model.warehouseEntity().getEntityBehavior(LInventoryBehavior);
        this.openSubDialog(new SWarehouseWithdrawDialog(user, inventory), (result: any) => {
            this._model.withdrawItems(result as LEntity[]);
        });
    }
    
    private handleCancelCommand() {
        this._model.cancel();
    }
}

