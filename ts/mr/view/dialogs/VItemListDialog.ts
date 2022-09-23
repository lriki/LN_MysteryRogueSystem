import { SItemListDialog } from "ts/mr/system/dialogs/SItemListDialog";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";
import { LEntity } from "ts/mr/lively/LEntity";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VItemListDialogBase, VItemListMode } from "./VItemListDialogBase";
import { UInventory } from "ts/mr/usecases/UInventory";

export class VItemListDialog extends VItemListDialogBase {
    private _model: SItemListDialog;

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
        super(model.inventory, model, VItemListMode.Use);
        this._model = model;

        const equipmentUser = this._model.actor.findEntityBehavior(LEquipmentUserBehavior);
        if (equipmentUser) {
            this.itemListWindow.setEquipmentUser(equipmentUser);
        }
    }
    
    onCreate() {
        super.onCreate();
    }

    
    onUpdate() {
        if (Input.isTriggered("pagedown")) {
            UInventory.sort(this._model.inventory);
            this.itemListWindow.refreshItems();
            this.itemListWindow.playCursorSound();
        }
    }

    onSelectedItemsChanged(items: LEntity[]): void {
        this._model.setSelectedEntity(items[0]);    // TODO: multi
    }

    // override
    onMakeCommandList(window: VFlexCommandWindow): void {
        const itemEntity = this.itemListWindow.selectedItem();
        this.commandWindow.setupFromCommandList(this._model.makeActionList(itemEntity));
        super.onMakeCommandList(window);
    }
}
