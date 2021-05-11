import { tr } from "ts/Common";
import { LWarehouseStoreDialog } from "ts/system/dialogs/LWarehouseStoreDialog";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/objects/LEntity";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListWindow } from "../windows/VItemListWindow";
import { VDialog } from "./VDialog";

export class VWarehouseStoreDialog extends VDialog {
    _model: LWarehouseStoreDialog;
    _itemListWindow: VItemListWindow;
    _commandWindow: VFlexCommandWindow;

    public constructor(model: LWarehouseStoreDialog) {
        super(model);
        this._model = model;
        
        const y = 100;
        const cw = 200;
        this._itemListWindow = new VItemListWindow(this._model.inventory(), new Rectangle(0, y, Graphics.boxWidth - cw, 400));
        this._itemListWindow.setHandler("ok", () => this.handleItemSubmit());
        this._itemListWindow.setHandler("cancel", () => this.handleItemCancel());
        this._itemListWindow.forceSelect(0);
        this.addWindow(this._itemListWindow);

        // CommandWindow は最初は空。表示するとき、複数選択かどうかなどを考慮して Command を作る。
        this._commandWindow = new VFlexCommandWindow(new Rectangle(Graphics.boxWidth - cw, y, 200, 200));
        this.addWindow(this._commandWindow);
    }
    
    onCreate() {
        this.activateItemWindow();
    }
    
    onUpdate() {
    }

    private handleItemSubmit(): void {
        if (this._itemListWindow && this._commandWindow) {
            const items = this._itemListWindow.selectedItems();

            this._commandWindow.clear();
            this._commandWindow.addSystemCommand(tr("預ける"), "store", () => this.handleStore(items));
            this._commandWindow.refresh();
            this._commandWindow.setHandler("cancel", () => this.handleCommandCancel());

            this._itemListWindow.deactivate();
            this._commandWindow.openness = 255;
            this._commandWindow.activate();
        }
    }
        
    private handleItemCancel(): void {
        this.cancel();
    }

    private handleCommandCancel(): void {
        if (this._itemListWindow && this._commandWindow) {
            this._itemListWindow.activate();
            this._commandWindow.deactivate();
            this._commandWindow.openness = 0;
        }
    }

    private handleStore(items: LEntity[]): void {
        this._model.setResultItems(items);
        this._model.submit();
    }

    private activateItemWindow() {
        if (this._itemListWindow) {
            this._itemListWindow.refresh();
            this._itemListWindow.activate();
        }
    };

}
