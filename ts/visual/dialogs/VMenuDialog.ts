
import { SItemListDialog, SItemListMode } from "ts/system/dialogs/SItemListDialog";
import { SMainMenuDialog } from "ts/system/dialogs/SMainMenuDialog";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { STextManager } from "ts/system/STextManager";
import { VMenuCommandWindow } from "../windows/VMenuCommandWindow";
import { VDialog } from "./VDialog";
import { LFeetDialog } from "ts/system/dialogs/SFeetDialog";
import { tr2 } from "ts/Common";
import { TileShape } from "ts/objects/LBlock";

export class VMainMenuDialog extends VDialog {
    _model: SMainMenuDialog;
    _commandWindow: VMenuCommandWindow | undefined;

    constructor(model: SMainMenuDialog) {
        super(model);
        this._model = model;
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
        const inventory = entity.findBehavior(LInventoryBehavior);
        if (inventory) {
            this.openSubDialog(new SItemListDialog(entity, inventory, SItemListMode.Use), d => {
                if (d.isSubmitted()) this.submit();
            });
        }
    }

    private handleFeet() {
        const feetEntity = REGame.map.firstFeetEntity(this._model.entity());
        if (feetEntity) {
            this.openSubDialog(new LFeetDialog(feetEntity), d => {
                if (d.isSubmitted()) this.submit();
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

