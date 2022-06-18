import { tr, tr2 } from "ts/mr/Common";
import { SWarehouseStoreDialog } from "ts/mr/system/dialogs/SWarehouseStoreDialog";
import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/mr/objects/LEntity";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListWindow } from "../windows/VItemListWindow";
import { VDialog } from "./VDialog";
import { VItemListDialogBase, VItemListMode } from "./VItemListDialogBase";
import { SDetailsDialog } from "ts/mr/system/dialogs/SDetailsDialog";

export class VWarehouseStoreDialog extends VItemListDialogBase {
    _model: SWarehouseStoreDialog;

    public constructor(model: SWarehouseStoreDialog) {
        super(model.inventory, model, VItemListMode.Use);
        this._model = model;
        this.itemListWindow.multipleSelectionEnabled = true;
    }

    // override
    onMakeCommandList(window: VFlexCommandWindow): void {
        window.addSystemCommand(tr2("預ける"), "store", () => this.handleStore());
        super.onMakeCommandList(window);
    }

    private handleStore(): void {
        const items = this.itemListWindow.getSelectedItems();
        this._model.setResultItems(items);
        this._model.storeItems(this._model.resultItems());
    }
}
