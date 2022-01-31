import { tr } from "ts/re/Common";
import { SWarehouseWithdrawDialog } from "ts/re/system/dialogs/SWarehouseWithdrawDialog";
import { LEntity } from "ts/re/objects/LEntity";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListDialogBase } from "./VItemListDialogBase";

export class VWarehouseWithdrawDialog extends VItemListDialogBase {
    private _model: SWarehouseWithdrawDialog;

    public constructor(model: SWarehouseWithdrawDialog) {
        super(model.inventory, model);
        this._model = model;
        this.itemListWindow.multipleSelectionEnabled = true;
    }

    protected onMakeCommandList(window: VFlexCommandWindow): void {
        const items = this.itemListWindow.getSelectedItems();
        window.addSystemCommand(tr("引き出す"), "store", () => this.handleWithdraw(items));
        super.onMakeCommandList(window);
    }
    
    private handleWithdraw(items: LEntity[]): void {
        this._model.setResultItems(items);
        this._model.withdrawItems(items);
    }
}
