import { tr2 } from "ts/mr/Common";
import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { EntityIdentificationLevel } from "ts/mr/lively/LIdentifyer";
import { MRLively } from "ts/mr/lively/MRLively";
import { paramInventoryItemsPerPage } from "ts/mr/PluginParameters";
import { SDetailsDialog } from "ts/mr/system/dialogs/SDetailsDialog";
import { SNicknameDialog } from "ts/mr/system/dialogs/SNicknameDialog";
import { SDialog } from "ts/mr/system/SDialog";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListWindow } from "../windows/VItemListWindow";
import { VDialog } from "./VDialog";
import { SInventoryDialogBase } from "ts/mr/system/dialogs/SInventoryDialogBase";

export enum VItemListMode {
    Use,
    Selection,
}

export class VItemListDialogBase extends VDialog {
    public readonly model: SInventoryDialogBase;
    private _inventory: LInventoryBehavior;
    private _itemListWindow: VItemListWindow;
    private _commandWindow: VFlexCommandWindow;
    private _mode: VItemListMode;

    public constructor(inventory: LInventoryBehavior, model: SInventoryDialogBase, mode: VItemListMode) {
        super(model);
        this.model = model;
        this._inventory = inventory;
        this._mode = mode;

        
        
        const y = 100;
        const cw = 200;
        this._itemListWindow = new VItemListWindow(new Rectangle(0, y, Graphics.boxWidth - cw, 400), model);
        this._itemListWindow.multipleSelectionEnabled = model.multipleSelectionEnabled;
        //this._itemListWindow.setInventory(this._inventory);
        this._itemListWindow.setHandler("ok", () => this.handleItemSubmit());
        this._itemListWindow.setHandler("cancel", () => this.handleItemCancel());
        this._itemListWindow.forceSelect(0);
        this.addWindow(this._itemListWindow);
        this.activateWindow(this._itemListWindow);
        this._itemListWindow.selectionChanged = () => {
            const item = this.model.items[this._itemListWindow.index()];
            if (item) {
                this.model.focusEntity(item);
            }
            //const items = this._itemListWindow.getSelectedItems();
            //this.model.focusEntity(items[0]);    // TODO: multi
        };

        // Layout
        {
            const contentHeight = this._itemListWindow.itemHeight() * paramInventoryItemsPerPage;
            this._itemListWindow.height = contentHeight + this._itemListWindow.padding * 2;
            this._itemListWindow.refresh();

            //this._itemListWindow.y = Graphics.boxHeight - this._itemListWindow.height;
            this._itemListWindow.y = 64;

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

    onUpdate() {
    }

    protected onSelectionSubmit(): void {

    }

    protected onMakeCommandList(window: VFlexCommandWindow): void {
        if (!this.model.isMultiSelectMode) {

            if (1) {
                const owner = this._inventory.ownerEntity();
                const itemEntity = this.itemListWindow.selectedItem();
                const level = MRLively.getCurrentIdentifyer().getEntityIdentificationLevel(owner, itemEntity);
                if (level == EntityIdentificationLevel.Unidentified) {
                    window.addSystemCommand(tr2("名前"), "nickname", () => this.handleNickname());
                }
            }

            window.addSystemCommand(tr2("説明"), "details", () => this.handleDetails());
        }
    }

    protected activateCommandWindow(): void {
        this._commandWindow.refresh();
        this._commandWindow.openness = 255;
        this.activateWindow(this._commandWindow);
    }

    private handleItemSubmit(): void {

        if (this._mode == VItemListMode.Use) {
            if (this._itemListWindow && this._commandWindow) {
                this._commandWindow.clear();
                this.onMakeCommandList(this._commandWindow);
                this._commandWindow.setHandler("cancel", () => this.handleCommandCancel());
                this._commandWindow.fitHeight();
                this.activateCommandWindow();
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
            this.activateWindow(this._itemListWindow);
            this._commandWindow.openness = 0;
        }
    }
    
    private handleNickname(): void {
        const owner = this._inventory.ownerEntity();
        const itemEntity = this.itemListWindow.selectedItem();
        const model = new SNicknameDialog(owner, itemEntity);
        this.model.openSubDialog(model, (result: SNicknameDialog) => {
            this._itemListWindow.refresh();
            this.activateCommandWindow();
            return true;
        });
    }

    private handleDetails(): void {
        const itemEntity = this.itemListWindow.selectedItem();
        const model = new SDetailsDialog(itemEntity);
        this.model.openSubDialog(model, (result: SDetailsDialog) => {
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

