import { assert, tr } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { REDialogContext } from "ts/system/REDialog";
import { RESystem } from "ts/system/RESystem";
import { VActionCommandWindow, ActionCommand } from "../windows/VActionCommandWindow";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListWindow } from "../windows/VItemListWindow";
import { VSubDialog } from "./VSubDialog";

export class VWarehouseStoreDialog extends VSubDialog {
    _actorEntity: REGame_Entity;
    _inventory: LInventoryBehavior;
    _itemListWindow: VItemListWindow;
    _commandWindow: VFlexCommandWindow;

    public constructor(actorEntity: REGame_Entity, inventory: LInventoryBehavior) {
        super();
        this._actorEntity = actorEntity;
        this._inventory = inventory;
        
        const y = 100;
        const cw = 200;
        this._itemListWindow = new VItemListWindow(this._inventory, new Rectangle(0, y, Graphics.boxWidth - cw, 400));
        this._itemListWindow.setHandler("ok", () => this.handleItemSubmit());
        this._itemListWindow.setHandler("cancel", () => this.handleItemCancel());
        this._itemListWindow.forceSelect(0);
        this.addWindow(this._itemListWindow);

        // CommandWindow は最初は空。表示するとき、複数選択かどうかなどを考慮して Command を作る。
        this._commandWindow = new VFlexCommandWindow(new Rectangle(Graphics.boxWidth - cw, y, 200, 200));
        this.addWindow(this._commandWindow);
    }
    
    onCreate() {
        this.activateItemWindow();
    }
    
    onUpdate() {
    }

    private handleItemSubmit(): void {
        if (this._itemListWindow && this._commandWindow) {
            const items = this._itemListWindow.selectedItems();

            this._commandWindow.clear();
            this._commandWindow.addSystemCommand(tr("預ける"), "store", () => this.handleStore(items));
            this._commandWindow.refresh();
            this._commandWindow.setHandler("cancel", () => this.handleCommandCancel());

            this._itemListWindow.deactivate();
            this._commandWindow.openness = 255;
            this._commandWindow.activate();
        }
    }
        
    private handleItemCancel(): void {
        this.cancel();
    }

    private handleCommandCancel(): void {
        if (this._itemListWindow && this._commandWindow) {
            this._itemListWindow.activate();
            this._commandWindow.deactivate();
            this._commandWindow.openness = 0;
        }
    }

    private handleStore(items: [REGame_Entity]): void {
        this.submit(items);
    }

    private activateItemWindow() {
        if (this._itemListWindow) {
            this._itemListWindow.refresh();
            this._itemListWindow.activate();
        }
    };

}
