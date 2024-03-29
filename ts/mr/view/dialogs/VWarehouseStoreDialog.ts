import { tr, tr2 } from "ts/mr/Common";
import { SWarehouseStoreDialog } from "ts/mr/system/dialogs/SWarehouseStoreDialog";
import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { VFlexCommandWindow } from "../window/windows/VFlexCommandWindow";
import { VItemListWindow } from "../window/windows/VItemListWindow";
import { VDialog } from "./VDialog";
import { VItemListDialogBase, VItemListMode } from "./VItemListDialogBase";
import { SDetailsDialog } from "ts/mr/system/dialogs/SDetailsDialog";
import { VWindowHelper } from "../window/VWindowHelper";

export class VWarehouseStoreDialog extends VItemListDialogBase {
    _model: SWarehouseStoreDialog;
    private _capacityWindow: Window_Help;

    public constructor(model: SWarehouseStoreDialog) {
        super(model.inventory, model, VItemListMode.Use);
        this._model = model;
        this.itemListWindow.multipleSelectionEnabled = model.multipleSelectionEnabled;

        const inventory = model.warehouseInventory;
        const w = 200;
        const h = VWindowHelper.calcWindowHeight(2, false);
        this._capacityWindow = new Window_Help(new Rectangle(Graphics.boxWidth - w,  Graphics.boxHeight - h, w, h));
        this._capacityWindow.setText(tr2("倉庫") + `\n${inventory.itemCount}/${inventory.capacity}`);
        this.addWindow(this._capacityWindow);
    }

    // override
    onMakeCommandList(window: VFlexCommandWindow): void {
        window.addSystemCommand(tr2("預ける"), "store", () => this.handleStore());
        super.onMakeCommandList(window);
    }

    private handleStore(): void {
        this._model.storeItems(this._model.selectedEntities());
    }
}
