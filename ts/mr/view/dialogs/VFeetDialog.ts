import { SFeetDialog } from "ts/mr/system/dialogs/SFeetDialog";
import { VDialog } from "./VDialog";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VEntityCaptionWindow } from "../windows/VEntityCaptionWindow";
import { tr2 } from "ts/mr/Common";
import { SDetailsDialog } from "ts/mr/system/dialogs/SDetailsDialog";

/**
 * [足元]
 */
export class VFeetDialog extends VDialog {
    _model: SFeetDialog;
    _entityNameWindow: VEntityCaptionWindow;
    _commandWindow: VFlexCommandWindow;

    constructor(model: SFeetDialog) {
        super(model);
        this._model = model;

        const y = 100;
        const cw = 200;

        this._entityNameWindow = new VEntityCaptionWindow(this._model.item);
        this.addWindow(this._entityNameWindow);

        this._commandWindow = new VFlexCommandWindow(new Rectangle(Graphics.boxWidth - cw, y, 200, 200));
        this._commandWindow.setupFromCommandList(this._model.makeActionList());
        this._commandWindow.addSystemCommand(tr2("説明"), "details", () => this.handleDetails());
        this._commandWindow.setHandler("cancel", () => this.cancel());
        this._commandWindow.refresh();
        this._commandWindow.open();
        this.addWindow(this._commandWindow);
        this.activateWindow(this._commandWindow);
    }
    
    private handleDetails(): void {
        const model = new SDetailsDialog(this._model.item);
        this.model.openSubDialog(model, (result: SDetailsDialog) => {
            this.activateWindow(this._commandWindow);
            return true;
        });
    }
}
