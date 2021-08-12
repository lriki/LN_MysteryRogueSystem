import { tr } from "ts/Common";
import { SWarehouseWithdrawDialog } from "ts/system/dialogs/SWarehouseWithdrawDialog";
import { LEntity } from "ts/objects/LEntity";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListDialogBase } from "./VItemListDialogBase";
import { DialogSubmitMode } from "ts/system/SDialog";

export class VWarehouseWithdrawDialog extends VItemListDialogBase {
    private _model: SWarehouseWithdrawDialog;

    public constructor(model: SWarehouseWithdrawDialog) {
        super(model.entity(), model.inventory(), model);
        this._model = model;
    }

    protected onMakeCommandList(window: VFlexCommandWindow): void {
        const items = this._itemListWindow.selectedItems();

        this._commandWindow.addSystemCommand(tr("引き出す"), "store", () => this.handleWithdraw(items));
        this._commandWindow.refresh();
    }
    
    private handleWithdraw(items: LEntity[]): void {
        this._model.setResultItems(items);
        this._model.submit(DialogSubmitMode.Close);
    }
}
