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

    public constructor(model: SWarehouseStoreDialog) {
        super(model.entity(), model.inventory(), model);
        this._model = model;
        this.itemListWindow.multipleSelectionEnabled = true;
    }
    
    onUpdate() {
    }

    // override
    onMakeCommandList(window: VFlexCommandWindow): void {

        this.commandWindow.clear();
        this.commandWindow.addSystemCommand(tr("預ける"), "store", () => this.handleStore());
        
        this.itemListWindow.deactivate();
        this.commandWindow.openness = 255;
        this.commandWindow.activate();
    }

    private handleStore(): void {
        const items = this.itemListWindow.getSelectedItems();
        this._model.setResultItems(items);
        this._model.submit();
    }
}
