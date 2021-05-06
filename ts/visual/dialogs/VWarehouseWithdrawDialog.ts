import { tr } from "ts/Common";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/objects/LEntity";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListDialogBase } from "./VItemListDialogBase";

export class VWarehouseWithdrawDialog extends VItemListDialogBase {

    public constructor(actorEntity: LEntity, inventory: LInventoryBehavior) {
        super(actorEntity, inventory);
    }

    protected onMakeCommandList(window: VFlexCommandWindow): void {
        const items = this._itemListWindow.selectedItems();

        this._commandWindow.addSystemCommand(tr("引き出す"), "store", () => this.handleWithdraw(items));
        this._commandWindow.refresh();
    }
    
    private handleWithdraw(items: [LEntity]): void {
        this.submit(items);
    }
}
