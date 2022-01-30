import { tr, tr2 } from "ts/re/Common";
import { SWarehouseWithdrawDialog } from "ts/re/system/dialogs/SWarehouseWithdrawDialog";
import { LEntity } from "ts/re/objects/LEntity";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListDialogBase } from "./VItemListDialogBase";
import { SItemSellDialog } from "ts/re/system/dialogs/SItemSellDialog";

export class VItemSellDialog extends VItemListDialogBase {
    private _model: SItemSellDialog;

    public constructor(model: SItemSellDialog) {
        super(model.inventory, model);
        this._model = model;
        this.itemListWindow.multipleSelectionEnabled = true;
    }

    protected onMakeCommandList(window: VFlexCommandWindow): void {
        const items = this.itemListWindow.getSelectedItems();
        window.addSystemCommand(tr2("売る"), "sell", () => this.handleSell(items));
    }
    
    private handleSell(items: LEntity[]): void {
        this._model.setResultItems(items);
        this._model.submitSell();
    }
}
