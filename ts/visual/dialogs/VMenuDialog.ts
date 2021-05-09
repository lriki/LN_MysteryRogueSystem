
import { LItemListDialog } from "ts/dialogs/LItemListDialog";
import { LMainMenuDialog } from "ts/dialogs/LMainMenuDialog";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { STextManager } from "ts/system/STextManager";
import { VMenuCommandWindow } from "../windows/VMenuCommandWindow";
import { VDialog } from "./VDialog";

export class VMenuDialog extends VDialog {
    _model: LMainMenuDialog;
    _commandWindow: VMenuCommandWindow | undefined;

    constructor(model: LMainMenuDialog) {
        super(model);
        this._model = model;
    }
    
    onCreate() {
        const y = 100;
        const cw = 200;
        this._commandWindow = new VMenuCommandWindow(new Rectangle(0, y, cw, 240));
        this.addWindow(this._commandWindow);

        this._commandWindow.setHandler("item", this.handleItem.bind(this));
        this._commandWindow.setHandler("cancel", () => this.cancel());
        this._commandWindow.setHandler("save", this.handleSave.bind(this));
        this._commandWindow.setHandler("suspend", this.handleSuspend.bind(this));
    }
    
    onStart() {
        this._commandWindow?.activate();
    }


    private handleItem() {
        const entity = this._model.entity();
        const inventory = entity.findBehavior(LInventoryBehavior);
        if (inventory) {
            this.openSubDialog(new LItemListDialog(entity, inventory), d => {
                if (d.isSubmitted()) this.submit();
            });
        }
    }

    private handleSave() {
        SceneManager.push(Scene_Save);
        this.cancel();
    }

    private handleSuspend() {
        throw new Error("Not implemented.");
    }
}

