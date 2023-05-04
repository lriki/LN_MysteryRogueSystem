
import { SItemListDialog } from "ts/mr/system/dialogs/SItemListDialog";
import { SMainMenuDialog } from "ts/mr/system/dialogs/SMainMenuDialog";
import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { VMenuCommandWindow } from "../windows/VMenuCommandWindow";
import { VDialog } from "./VDialog";
import { SFeetDialog } from "ts/mr/system/dialogs/SFeetDialog";
import { tr2 } from "ts/mr/Common";
import { VMainStatusWindow } from "../windows/VMainStatusWindow";
import { VLayout } from "../ui/VUIElement";
import { UDialog } from "ts/mr/utility/UDialog";
import { Scene_MRQuest } from "ts/mr/rmmz/Scene_MRQuest";

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
        this._commandWindow.setHandler("quest", this.handleQuest.bind(this));
    }
    
    onStart() {
        this._commandWindow?.activate();
    }

    private handleItem() {
        UDialog.postOpenInventoryDialog(this.commandContext(), this._model.entity(), dialog => {});
    }

    private handleFeet() {
        if (!UDialog.postOpenFeetDialog(this.commandContext(), this._model.entity(), dialog => {})) {
            this.cancel();
        }
    }

    private handleSave() {
        SceneManager.push(Scene_Save);
        this.cancel();
    }

    private handleSuspend() {
        throw new Error("Not implemented.");
    }

    private handleQuest() {
        SceneManager.push(Scene_MRQuest);
    }
}

