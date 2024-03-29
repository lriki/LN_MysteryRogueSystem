import { tr, tr2 } from "ts/mr/Common";
import { SWarehouseWithdrawDialog } from "ts/mr/system/dialogs/SWarehouseWithdrawDialog";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { VFlexCommandWindow } from "../window/windows/VFlexCommandWindow";
import { VItemListDialogBase, VItemListMode } from "./VItemListDialogBase";
import { VWindowHelper } from "../window/VWindowHelper";

export class VWarehouseWithdrawDialog extends VItemListDialogBase {
    private _model: SWarehouseWithdrawDialog;
    private _capacityWindow: Window_Help;

    public constructor(model: SWarehouseWithdrawDialog) {
        super(model.inventory, model, VItemListMode.Use);
        this._model = model;
        this.itemListWindow.multipleSelectionEnabled = model.multipleSelectionEnabled;

        const inventory = model.userInventory;
        const w = 200;
        const h = VWindowHelper.calcWindowHeight(2, false);
        this._capacityWindow = new Window_Help(new Rectangle(Graphics.boxWidth - w,  Graphics.boxHeight - h, w, h));
        this._capacityWindow.setText(tr2("持ち物") + `\n${inventory.itemCount}/${inventory.capacity}`);
        this.addWindow(this._capacityWindow);
    }

    protected onMakeCommandList(window: VFlexCommandWindow): void {
        const items = this._model.selectedEntities();
        window.addSystemCommand(tr("引き出す"), "store", () => this.handleWithdraw(items));
        super.onMakeCommandList(window);
    }
    
    private handleWithdraw(items: readonly LEntity[]): void {
        this._model.withdrawItems(items);
    }
}
