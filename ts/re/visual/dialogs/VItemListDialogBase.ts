import { tr2 } from "ts/re/Common";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { SDetailsDialog } from "ts/re/system/dialogs/SDetailsDialog";
import { SDialog } from "ts/re/system/SDialog";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListWindow } from "../windows/VItemListWindow";
import { VDialog } from "./VDialog";

export enum VItemListMode {
    Use,
    Selection,
}

enum VItemListDialogPhase {
    ItemSelecting,
    CommandSelection,
}

export class VItemListDialogBase extends VDialog {
    private _inventory: LInventoryBehavior;
    private _itemListWindow: VItemListWindow;
    private _commandWindow: VFlexCommandWindow;
    private _mode: VItemListMode;
    private _phase: VItemListDialogPhase;

    private _itemsParPage = 12;


    public constructor(inventory: LInventoryBehavior, model: SDialog, mode: VItemListMode) {
        super(model);
        this._inventory = inventory;
        this._mode = mode;
        this._phase = VItemListDialogPhase.ItemSelecting;

        
        
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

            this._itemListWindow.createContents();
            this._itemListWindow.refresh();
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
    
    onStart() {
        switch (this._phase) {
            case VItemListDialogPhase.ItemSelecting:
                this.itemListWindow.activate();
                break;
            case VItemListDialogPhase.CommandSelection:
                this.commandWindow.activate();
                break;
        }
    }

    onUpdate() {
    }

    protected onSelectedItemsChanged(items: LEntity[]): void {

    }

    protected onSelectionSubmit(): void {

    }

    protected onMakeCommandList(window: VFlexCommandWindow): void {
        if (!this.itemListWindow.isMultipleSelecting()) {
            window.addSystemCommand(tr2("説明"), "details", () => this.handleDetails());
        }
    }

    protected activateCommandWindow(): void {
        this._itemListWindow.deactivate();
        this._commandWindow.refresh();
        this._commandWindow.openness = 255;
        this._commandWindow.activate();
    }

    private handleItemSubmit(): void {
        this.onSelectedItemsChanged(this._itemListWindow.getSelectedItems());

        if (this._mode == VItemListMode.Use) {
            if (this._itemListWindow && this._commandWindow) {
                this._commandWindow.clear();
                this.onMakeCommandList(this._commandWindow);
                this._commandWindow.setHandler("cancel", () => this.handleCommandCancel());
                this._commandWindow.fitHeight();
                this.activateCommandWindow();
                this._phase = VItemListDialogPhase.CommandSelection;
            }
        }
        else if (this._mode == VItemListMode.Selection) {
            this.onSelectionSubmit();
            this.submit();
        }
        else {
            throw new Error("Unreachable.");
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
            this._phase = VItemListDialogPhase.ItemSelecting;
        }
    }
    
    private handleDetails(): void {
        const itemEntity = this.itemListWindow.selectedItem();
        const model = new SDetailsDialog(itemEntity);
        this.openSubDialog(model, (result: any) => {
            this.activateCommandWindow();
            return true;
        });
    }

    private activateItemWindow() {
        if (this._itemListWindow) {
            this._itemListWindow.refresh();
            this._itemListWindow.activate();
        }
    }
}

