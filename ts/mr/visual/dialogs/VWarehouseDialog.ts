// import { SWarehouseDialog } from "ts/mr/system/dialogs/SWarehouseDialog";
// import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
// import { LEntity } from "ts/mr/objects/LEntity";
// import { VWarehouseMenuCommandWindow } from "../windows/VWarehouseMenuCommandWindow";
// import { SWarehouseStoreDialog } from "ts/mr/system/dialogs/SWarehouseStoreDialog";
// import { SWarehouseWithdrawDialog } from "ts/mr/system/dialogs/SWarehouseWithdrawDialog";
// import { VDialog } from "./VDialog";
// import { SDialog } from "ts/mr/system/SDialog";

// export class VWarehouseDialog extends VDialog {
//     private _model: SWarehouseDialog;
//     private _commandWindow: VWarehouseMenuCommandWindow;

//     constructor(model: SWarehouseDialog) {
//         super(model);
//         this._model = model;
//         const y = 100;
//         const cw = 200;
//         this._commandWindow = new VWarehouseMenuCommandWindow(new Rectangle(0, y, cw, 200));
//         this._commandWindow.setHandler("store", () => this.handleStoreCommand());
//         this._commandWindow.setHandler("withdraw", () => this.handleWithdrawCommand());
//         this._commandWindow.setHandler("cancel", () => this.handleCancelCommand());
//     }
    
//     onCreate() {
//         this.addWindow(this._commandWindow);
//     }
    
//     onStart() {
//         this._commandWindow?.activate();
//     }

//     private handleStoreCommand() {
//         const user = this._model.userEntity();
//         this.openSubDialog(new SWarehouseStoreDialog(user, this._model.warehouseEntity()), (result: SWarehouseStoreDialog) => {
//             //this._model.storeItems(result.resultItems());
//             return true;
//         });

//     }

//     private handleWithdrawCommand() {

//         const user = this._model.userEntity();
//         this.openSubDialog(new SWarehouseWithdrawDialog(user, this._model.warehouseEntity()), (result: SWarehouseWithdrawDialog) => {
//             this._model.withdrawItems(result.resultItems());
//             return true;
//         });
//     }
    
//     private handleCancelCommand() {
//         this._model.cancel();
//     }
// }

