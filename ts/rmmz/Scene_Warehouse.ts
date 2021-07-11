import { SWarehouseDialog } from "ts/system/dialogs/SWarehouseDialog";
import { REDialogVisualNavigator } from "ts/visual/dialogs/REDialogVisual";

export class Scene_Warehouse extends Scene_MenuBase {
    static dialogData: SWarehouseDialog;

    private _dialogNavigator: REDialogVisualNavigator;

    constructor() {
        super();
        this._dialogNavigator = new REDialogVisualNavigator();
    }

    start(): void {
        super.start();
    }
}

