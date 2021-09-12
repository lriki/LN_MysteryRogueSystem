import { tr } from "ts/re/Common";
import { SWarehouseWithdrawDialog } from "ts/re/system/dialogs/SWarehouseWithdrawDialog";
import { LEntity } from "ts/re/objects/LEntity";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListDialogBase } from "./VItemListDialogBase";

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
        this._model.submit();
    }
}