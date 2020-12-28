import { assert, tr } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { ActionId, REData } from "ts/data/REData";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { REDialogContext } from "ts/system/REDialog";
import { RESystem } from "ts/system/RESystem";
import { VActionCommandWindow, ActionCommand } from "../windows/VActionCommandWindow";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListWindow } from "../windows/VItemListWindow";
import { VItemListDialogBase } from "./VItemListDialogBase";

export class VWarehouseWithdrawDialog extends VItemListDialogBase {

    public constructor(actorEntity: REGame_Entity, inventory: LInventoryBehavior) {
        super(actorEntity, inventory);
    }

    protected onMakeCommandList(window: VFlexCommandWindow): void {
        const items = this._itemListWindow.selectedItems();

        this._commandWindow.addSystemCommand(tr("引き出す"), "store", () => this.handleWithdraw(items));
        this._commandWindow.refresh();
    }
    
    private handleWithdraw(items: [REGame_Entity]): void {
        this.pop(items);
    }
}
