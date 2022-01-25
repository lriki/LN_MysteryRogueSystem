import { tr, tr2 } from "ts/re/Common";
import { SWarehouseStoreDialog } from "ts/re/system/dialogs/SWarehouseStoreDialog";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListWindow } from "../windows/VItemListWindow";
import { VDialog } from "./VDialog";
import { VItemListDialogBase } from "./VItemListDialogBase";
import { SDetailsDialog } from "ts/re/system/dialogs/SDetailsDialog";

export class VWarehouseStoreDialog extends VItemListDialogBase {
    _model: SWarehouseStoreDialog;

    public constructor(model: SWarehouseStoreDialog) {
        super(model.user, model.inventory, model);
        this._model = model;
        this.itemListWindow.multipleSelectionEnabled = true;
    }

    // override
    onMakeCommandList(window: VFlexCommandWindow): void {
        //window.clear();
        window.addSystemCommand(tr2("預ける"), "store", () => this.handleStore());
        if (!this.itemListWindow.isMultipleSelecting()) {
            window.addSystemCommand(tr2("説明"), "details", () => this.handleDetails());
        }
        
        // this.itemListWindow.deactivate();
        // window.openness = 255;
        // window.activate();
    }

    private handleStore(): void {
        const items = this.itemListWindow.getSelectedItems();
        this._model.setResultItems(items);
        this._model.storeItems(this._model.resultItems());
    }
    
    private handleDetails(): void {
        const itemEntity = this.itemListWindow.selectedItem();
        const model = new SDetailsDialog(itemEntity);
        this.openSubDialog(model, (result: any) => {
            this.activateCommandWindow();
        });
    }
}
