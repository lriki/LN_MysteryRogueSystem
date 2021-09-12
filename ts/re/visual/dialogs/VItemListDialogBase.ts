import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { SDialog } from "ts/re/system/SDialog";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListWindow } from "../windows/VItemListWindow";
import { VDialog } from "./VDialog";

export class VItemListDialogBase extends VDialog {
    _actorEntity: LEntity;
    _inventory: LInventoryBehavior;
    _itemListWindow: VItemListWindow;
    _commandWindow: VFlexCommandWindow;

    public constructor(actorEntity: LEntity, inventory: LInventoryBehavior, model: SDialog) {
        super(model);
        this._actorEntity = actorEntity;
        this._inventory = inventory;
        
        const y = 100;
        const cw = 200;
        this._itemListWindow = new VItemListWindow(new Rectangle(0, y, Graphics.boxWidth - cw, 400));
        this._itemListWindow.setInventory(this._inventory);
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

    protected onMakeCommandList(window: VFlexCommandWindow): void {

    }

    private handleItemSubmit(): void {
        if (this._itemListWindow && this._commandWindow) {

            this._commandWindow.clear();
            this.onMakeCommandList(this._commandWindow);
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

    private activateItemWindow() {
        if (this._itemListWindow) {
            this._itemListWindow.refresh();
            this._itemListWindow.activate();
        }
    };

}
