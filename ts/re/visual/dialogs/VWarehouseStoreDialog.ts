import { tr } from "ts/re/Common";
import { SWarehouseStoreDialog } from "ts/re/system/dialogs/SWarehouseStoreDialog";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListWindow } from "../windows/VItemListWindow";
import { VDialog } from "./VDialog";
import { VItemListDialogBase } from "./VItemListDialogBase";

export class VWarehouseStoreDialog extends VItemListDialogBase {
    _model: SWarehouseStoreDialog;
    // _itemListWindow: VItemListWindow;
    // _commandWindow: VFlexCommandWindow;

    public constructor(model: SWarehouseStoreDialog) {
        super(model.entity(), model.inventory(), model);
        this._model = model;
        
        // const y = 100;
        // const cw = 200;
        // this._itemListWindow = new VItemListWindow(new Rectangle(0, y, Graphics.boxWidth - cw, 400));
        // this._itemListWindow.setInventory(this._model.inventory());
        // this._itemListWindow.setHandler("ok", () => this.handleItemSubmit());
        // this._itemListWindow.setHandler("cancel", () => this.handleItemCancel());
        // this._itemListWindow.forceSelect(0);
        // this.addWindow(this._itemListWindow);

        // CommandWindow は最初は空。表示するとき、複数選択かどうかなどを考慮して Command を作る。
        // this._commandWindow = new VFlexCommandWindow(new Rectangle(Graphics.boxWidth - cw, y, 200, 200));
        // this.addWindow(this._commandWindow);
    }
    
    // onCreate() {
    //     this.activateItemWindow();
    // }
    
    onUpdate() {
    }

    // override
    onMakeCommandList(window: VFlexCommandWindow): void {

        this.commandWindow.clear();
        this.commandWindow.addSystemCommand(tr("預ける"), "store", () => this.handleStore());
        
        //this._commandWindow.setHandler("cancel", () => this.handleCommandCancel());

        this.itemListWindow.deactivate();
        this.commandWindow.openness = 255;
        this.commandWindow.activate();
    }

    // private handleItemSubmit(): void {
    //     if (this._itemListWindow && this._commandWindow) {
    //         const items = this._itemListWindow.selectedItems();

    //         this._commandWindow.clear();
    //         this._commandWindow.addSystemCommand(tr("預ける"), "store", () => this.handleStore(items));
            
    //         this._commandWindow.setHandler("cancel", () => this.handleCommandCancel());

    //         this._itemListWindow.deactivate();
    //         this._commandWindow.openness = 255;
    //         this._commandWindow.activate();
    //     }
    // }
        
    // private handleItemCancel(): void {
    //     this.cancel();
    // }

    // private handleCommandCancel(): void {
    //     if (this._itemListWindow && this._commandWindow) {
    //         this._itemListWindow.activate();
    //         this._commandWindow.deactivate();
    //         this._commandWindow.openness = 0;
    //     }
    // }

    private handleStore(): void {
        const items = this.itemListWindow.selectedItems();
        this._model.setResultItems(items);
        this._model.submit();
    }

    // private activateItemWindow() {
    //     if (this._itemListWindow) {
    //         this._itemListWindow.refresh();
    //         this._itemListWindow.activate();
    //     }
    // };

}
