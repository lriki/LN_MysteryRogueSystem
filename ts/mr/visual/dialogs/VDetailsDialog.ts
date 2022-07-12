import { VDialog } from "./VDialog";
import { SDetailsDialog } from "ts/mr/system/dialogs/SDetailsDialog";
import { VDetailsWindow } from "../windows/VDetailsWindow";

export class VDetailsDialog extends VDialog {
    private _model: SDetailsDialog;
    private _window: VDetailsWindow;

    constructor(model: SDetailsDialog) {
        super(model);
        this._model = model;
        this._window = new VDetailsWindow(model);
        this._window.onClose = () => this.handleClose();
        this.addWindow(this._window);
    }
    
    onCreate() {
    }
    
    onUpdate() {
    }

    private handleClose(): void {
        SoundManager.playOk();
        this.cancel();
    }
}
