import { tr } from "ts/Common";
import { LWarehouseWithdrawDialog } from "ts/system/dialogs/LWarehouseWithdrawDialog";
import { LEntity } from "ts/objects/LEntity";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListDialogBase } from "./VItemListDialogBase";

export class VWarehouseWithdrawDialog extends VItemListDialogBase {
    private _model: LWarehouseWithdrawDialog;

    public constructor(model: LWarehouseWithdrawDialog) {
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
        this._model.submit();
    }
}
