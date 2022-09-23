import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";
import { VItemListDialogBase, VItemListMode } from "./VItemListDialogBase";
import { SItemSelectionDialog } from "ts/mr/system/dialogs/SItemSelectionDialog";

export class VItemSelectionDialog extends VItemListDialogBase {
    private _model: SItemSelectionDialog;

    /**
     * 
     * @param actorEntity
     * @param inventory 
     * 
     * actorEntity はアイテム使用者。
     * 必ずしも Inventory を持っている Entity ではない点に注意。
     * 足元に置いてある壺の中を覗いたときは、actorEntity は Player となる。
     */
    constructor(model: SItemSelectionDialog) {
        super(model.inventory(), model, VItemListMode.Selection);
        this._model = model;

        const equipmentUser = this._model.entity().findEntityBehavior(LEquipmentUserBehavior);
        if (equipmentUser) {
            this.itemListWindow.setEquipmentUser(equipmentUser);
        }
    }
    
    onCreate() {
        super.onCreate();
    }
    
    onUpdate() {
        super.onUpdate();
    }

    onSelectionSubmit(): void {
        this._model.setSelectedEntity(this.itemListWindow.selectedItem());
    }
}
