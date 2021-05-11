import { LWarehouseDialog } from "ts/system/dialogs/LWarehouseDialog";
import { REDialogVisualNavigator } from "ts/visual/dialogs/REDialogVisual";

export class Scene_Warehouse extends Scene_MenuBase {
    static dialogData: LWarehouseDialog;

    private _dialogNavigator: REDialogVisualNavigator;

    constructor() {
        super();
        this._dialogNavigator = new REDialogVisualNavigator();
    }

    start(): void {
        super.start();
    }
}

