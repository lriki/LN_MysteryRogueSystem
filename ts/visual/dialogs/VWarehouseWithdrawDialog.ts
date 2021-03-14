import { assert, tr } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/objects/LEntity";
import { REDialogContext } from "ts/system/REDialog";
import { RESystem } from "ts/system/RESystem";
import { VActionCommandWindow, ActionCommand } from "../windows/VActionCommandWindow";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListWindow } from "../windows/VItemListWindow";
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
