import { DActionId } from "ts/re/data/DAction";
import { REBasics } from "ts/re/data/REBasics";
import { SItemListDialog } from "ts/re/system/dialogs/SItemListDialog";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { RESystem } from "ts/re/system/RESystem";
import { VItemListWindow } from "../windows/VItemListWindow";
import { VDialog } from "./VDialog";
import { REGame } from "ts/re/objects/REGame";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { REData } from "ts/re/data/REData";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { LStorageBehavior } from "ts/re/objects/behaviors/LStorageBehavior";
import { assert, tr2 } from "ts/re/Common";
import { LTileShape } from "ts/re/objects/LBlock";
import { SDetailsDialog } from "ts/re/system/dialogs/SDetailsDialog";
import { UAction } from "ts/re/usecases/UAction";
import { VItemListDialogBase, VItemListMode } from "./VItemListDialogBase";
import { UInventory } from "ts/re/usecases/UInventory";
import { SItemSelectionDialog } from "ts/re/system/dialogs/SItemSelectionDialog";

enum VItemListDialogPhase {
    ItemSelecting,
    CommandSelection,
}

export class VItemListDialog extends VItemListDialogBase {
    private _model: SItemListDialog;
    private _phase: VItemListDialogPhase;
    // _itemListWindow: VItemListWindow;// | undefined;
    // _commandWindow: VFlexCommandWindow | undefined;
    //_peekItemListWindow: VItemListWindow;

    /**
     * 
     * @param actorEntity
     * @param inventory 
     * 
     * actorEntity はアイテム使用者。
     * 必ずしも Inventory を持っている Entity ではない点に注意。
     * 足元に置いてある壺の中を覗いたときは、actorEntity は Player となる。
     */
    constructor(model: SItemListDialog) {
        super(model.inventory(), model, VItemListMode.Use);
        this._model = model;
        this._phase = VItemListDialogPhase.ItemSelecting;

        
        // const y = 100;
        // const cw = 200;
        // this._itemListWindow = new VItemListWindow(new Rectangle(0, y, Graphics.boxWidth - cw, 400));
        // this._itemListWindow.setInventory(this._model.inventory());
        // this._itemListWindow.setHandler("ok", this.handleItemOk.bind(this));
        // this._itemListWindow.setHandler("cancel", this.handleItemCancel.bind(this));
        // this._itemListWindow.forceSelect(0);
        // this.addWindow(this._itemListWindow);

        /*
        this._peekItemListWindow = new VItemListWindow(new Rectangle(0, y, Graphics.boxWidth - cw, 400));
        this._peekItemListWindow.setHandler("ok", this.handleItemOk.bind(this));
        this._peekItemListWindow.setHandler("cancel", this.handleItemCancel.bind(this));
        this._peekItemListWindow.forceSelect(0);
        this.addWindow(this._itemListWindow);
        */

        const equipmentUser = this._model.entity().findEntityBehavior(LEquipmentUserBehavior);
        if (equipmentUser) {
            this.itemListWindow.setEquipmentUser(equipmentUser);
        }
    }
    
    onCreate() {
        super.onCreate();
        // const y = 100;
        // const cw = 200;

        // this._commandWindow = new VFlexCommandWindow(new Rectangle(Graphics.boxWidth - cw, y, 200, 200));
        // this._commandWindow.setHandler("cancel", () => this.handleCommandCancel());
        // this.addWindow(this._commandWindow);

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
        if (Input.isTriggered("pagedown")) {
            UInventory.sort(this._model.inventory());
            this.itemListWindow.refreshItems();
            this.itemListWindow.playCursorSound();
        }
    }

    onSelectedItemsChanged(items: LEntity[]): void {
        this._model.setSelectedEntity(items[0]);    // TODO: multi
    }

    // private handleItemOk(): void {
    //     switch (this._model.mode()) {
    //         case SItemListMode.Use:
    //             this.showCommandListWindow();
    //             break;
    //         case SItemListMode.Selection:
    //             this._model.setSelectedEntity(this._itemListWindow.selectedItem());
    //             this.submit();
    //             break;
    //         default:
    //             throw new Error("Unreachable.");
    //     }
    // }
        
    // private handleItemCancel(): void {
    //     this.cancel();
    // }


    // handleCommandCancel(): void {
    //     if (this._itemListWindow && this._commandWindow) {
    //         this._itemListWindow.activate();
    //         this._commandWindow.deactivate();
    //         this._commandWindow.openness = 0;
    //     }
    // }

    // override
    onMakeCommandList(window: VFlexCommandWindow): void {
        const itemEntity = this.itemListWindow.selectedItem();
        this.commandWindow.setupFromCommandList(this._model.makeActionList(itemEntity));
        super.onMakeCommandList(window);
    }

    // private showCommandListWindow(): void {

    //     if (this._itemListWindow && this._commandWindow) {
    //         this._commandWindow.clear();

    //         this.activateCommandWindow();
    //     }
    // }

}
