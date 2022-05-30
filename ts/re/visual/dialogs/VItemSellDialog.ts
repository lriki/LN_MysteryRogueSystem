import { tr, tr2 } from "ts/re/Common";
import { SWarehouseWithdrawDialog } from "ts/re/system/dialogs/SWarehouseWithdrawDialog";
import { LEntity } from "ts/re/objects/LEntity";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListDialogBase, VItemListMode } from "./VItemListDialogBase";
import { SItemSellDialog } from "ts/re/system/dialogs/SItemSellDialog";
import { VItemListPriceTag } from "../windows/VItemListWindow";

export class VItemSellDialog extends VItemListDialogBase {
    private _model: SItemSellDialog;

    public constructor(model: SItemSellDialog) {
        super(model.inventory, model, VItemListMode.Use);
        this._model = model;
        this.itemListWindow.multipleSelectionEnabled = true;
        this.itemListWindow.priceTag = VItemListPriceTag.PurchasePrice;
    }

    protected onMakeCommandList(window: VFlexCommandWindow): void {
        const items = this.itemListWindow.getSelectedItems();
        window.addSystemCommand(tr2("売る"), "sell", () => this.handleSell(items));
        super.onMakeCommandList(window);
    }
    
    private handleSell(items: LEntity[]): void {
        SoundManager.playShop();
        this._model.setResultItems(items);
        this._model.submitSell();
    }
}
