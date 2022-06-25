
import { SItemListDialog } from "ts/mr/system/dialogs/SItemListDialog";
import { SMainMenuDialog } from "ts/mr/system/dialogs/SMainMenuDialog";
import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/objects/REGame";
import { VMenuCommandWindow } from "../windows/VMenuCommandWindow";
import { VDialog } from "./VDialog";
import { SFeetDialog } from "ts/mr/system/dialogs/SFeetDialog";
import { tr2 } from "ts/mr/Common";
import { VMainStatusWindow } from "../windows/VMainStatusWindow";
import { VLayout } from "../ui/VUIElement";

export class VMainMenuDialog extends VDialog {
    _model: SMainMenuDialog;
    _commandWindow: VMenuCommandWindow | undefined;
    _statusWindow: VMainStatusWindow;

    constructor(model: SMainMenuDialog) {
        super(model);
        this._model = model;
        this._statusWindow = new VMainStatusWindow(VLayout.makeGridRect(0, 8, 12, 4));
        this._statusWindow.setEntity(this._model.entity());
        this.addWindow(this._statusWindow);
    }
    
    onCreate() {
        const y = 100;
        const cw = 200;
        this._commandWindow = new VMenuCommandWindow(new Rectangle(0, y, cw, 240));
        this.addWindow(this._commandWindow);

        this._commandWindow.setHandler("item", this.handleItem.bind(this));
        this._commandWindow.setHandler("feet", this.handleFeet.bind(this));
        this._commandWindow.setHandler("cancel", () => this.cancel());
        this._commandWindow.setHandler("save", this.handleSave.bind(this));
        this._commandWindow.setHandler("suspend", this.handleSuspend.bind(this));
    }
    
    onStart() {
        this._commandWindow?.activate();
    }


    private handleItem() {
        const entity = this._model.entity();
        const inventory = entity.findEntityBehavior(LInventoryBehavior);
        if (inventory) {
            this._model.openSubDialog(new SItemListDialog(entity, inventory), d => {
                //if (d.isSubmitted()) this.submit();
                return false;
            });
        }
    }

    private handleFeet() {
        const feetEntity = REGame.map.firstFeetEntity(this._model.entity());
        if (feetEntity) {
            this._model.openSubDialog(new SFeetDialog(this._model.entity(), feetEntity), d => {
                //if (d.isSubmitted()) this.submit();
                return false;
            });
        }
        else {
            this.commandContext().postMessage(tr2("足元には何もない。"));
            this.cancel();
            //this.dialogContext().postReopen();
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

