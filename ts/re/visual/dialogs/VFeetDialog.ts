import { SFeetDialog } from "ts/re/system/dialogs/SFeetDialog";
import { VDialog } from "./VDialog";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VEntityCaptionWindow } from "../windows/VEntityCaptionWindow";

/**
 * [足元]
 */
export class VFeetDialog extends VDialog {
    _model: SFeetDialog;
    _entityNameWindow: VEntityCaptionWindow | undefined;
    _commandWindow: VFlexCommandWindow | undefined;

    constructor(model: SFeetDialog) {
        super(model);
        this._model = model;
    }
    
    onCreate() {
        const y = 100;
        const cw = 200;

        this._entityNameWindow = new VEntityCaptionWindow(this._model.targetEntity());
        this.addWindow(this._entityNameWindow);

        this._commandWindow = new VFlexCommandWindow(new Rectangle(Graphics.boxWidth - cw, y, 200, 200));
        this._commandWindow.setupFromCommandList(this._model.makeActionList());
        this._commandWindow.setHandler("cancel", () => this.cancel());
        this._commandWindow.refresh();
        this._commandWindow.open();
        this.addWindow(this._commandWindow);
        this.activateWindow(this._commandWindow);
    }
}
