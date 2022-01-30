import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { SDialog } from "ts/re/system/SDialog";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListWindow } from "../windows/VItemListWindow";
import { VDialog } from "./VDialog";

export class VItemListDialogBase extends VDialog {
    private _inventory: LInventoryBehavior;
    private _itemListWindow: VItemListWindow;
    private _commandWindow: VFlexCommandWindow;

    private _itemsParPage = 12;


    public constructor(inventory: LInventoryBehavior, model: SDialog) {
        super(model);
        this._inventory = inventory;

        
        
        const y = 100;
        const cw = 200;
        this._itemListWindow = new VItemListWindow(new Rectangle(0, y, Graphics.boxWidth - cw, 400));
        this._itemListWindow.setInventory(this._inventory);
        this._itemListWindow.setHandler("ok", () => this.handleItemSubmit());
        this._itemListWindow.setHandler("cancel", () => this.handleItemCancel());
        this._itemListWindow.forceSelect(0);
        this.addWindow(this._itemListWindow);

        // Layout
        {
            const contentHeight = this._itemListWindow.itemHeight() * this._itemsParPage;
            this._itemListWindow.height = contentHeight + this._itemListWindow.padding * 2;
            this._itemListWindow.refresh();

            this._itemListWindow.y = Graphics.boxHeight - this._itemListWindow.height;

            console.log("this._itemListWindow.y", this._itemListWindow.y);
            console.log("this._itemListWindow.padding", this._itemListWindow.padding);

            // this._itemListWindow.updatePlacement();
            // this._itemListWindow.updateBackground();
            this._itemListWindow.createContents();
            this._itemListWindow.refresh();
            // console.log("this._itemListWindow.itemHeight()", this._itemListWindow.itemHeight());
            // console.log("this._itemListWindow.contentsHeight()", this._itemListWindow.contentsHeight());
            // console.log("this._itemListWindow.itemRect()", this._itemListWindow.itemRect(0));
            // console.log("this._itemListWindow.itemRectWithPadding()", this._itemListWindow.itemRectWithPadding(0));
            ;
        }

        // CommandWindow は最初は空。表示するとき、複数選択かどうかなどを考慮して Command を作る。
        this._commandWindow = new VFlexCommandWindow(new Rectangle(Graphics.boxWidth - cw, this._itemListWindow.y, 200, 200));
        this.addWindow(this._commandWindow);
    }

    public get itemListWindow(): VItemListWindow {
        return this._itemListWindow;
    }

    public get commandWindow(): VFlexCommandWindow {
        return this._commandWindow;
    }
    
    onCreate() {
        this.activateItemWindow();
    }
    
    onUpdate() {
    }

    protected onMakeCommandList(window: VFlexCommandWindow): void {

    }

    protected activateCommandWindow(): void {
        this._itemListWindow.deactivate();
        this._commandWindow.refresh();
        this._commandWindow.openness = 255;
        this._commandWindow.activate();
    }

    private handleItemSubmit(): void {
        if (this._itemListWindow && this._commandWindow) {
            this._commandWindow.clear();
            this.onMakeCommandList(this._commandWindow);
            this._commandWindow.setHandler("cancel", () => this.handleCommandCancel());
            this._commandWindow.fitHeight();
            this.activateCommandWindow();
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

