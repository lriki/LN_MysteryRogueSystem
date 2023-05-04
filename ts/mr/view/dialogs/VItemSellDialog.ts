import { tr, tr2 } from "ts/mr/Common";
import { SWarehouseWithdrawDialog } from "ts/mr/system/dialogs/SWarehouseWithdrawDialog";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListDialogBase, VItemListMode } from "./VItemListDialogBase";
import { SItemSellDialog } from "ts/mr/system/dialogs/SItemSellDialog";
import { VItemListPriceTag } from "../windows/VItemListWindow";

export class VItemSellDialog extends VItemListDialogBase {
    private _model: SItemSellDialog;

    public constructor(model: SItemSellDialog) {
        super(model.inventory, model, VItemListMode.Use);
        this._model = model;
        this.itemListWindow.multipleSelectionEnabled = model.multipleSelectionEnabled;
        this.itemListWindow.priceTag = VItemListPriceTag.PurchasePrice;
    }

    protected onMakeCommandList(window: VFlexCommandWindow): void {
        const items = this._model.selectedEntities();
        window.addSystemCommand(tr2("売る"), "sell", () => this.handleSell(items));
        super.onMakeCommandList(window);
    }
    
    private handleSell(items: readonly LEntity[]): void {
        SoundManager.playShop();
        this._model.setResultItems(items);
        this._model.submitSell();
    }
}
