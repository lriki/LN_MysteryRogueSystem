import { SDialog, SDialogAction } from "ts/mr/system/SDialog";
import { MRSystem } from "ts/mr/system/MRSystem";
import { VDialogNavigator } from "./VDialogNavigator";
import { SDialogContext } from "ts/mr/system/SDialogContext";
import { SCommandContext } from "ts/mr/system/SCommandContext";

export class VDialog {
    public readonly model: SDialog;
    _created: boolean = false;
    _started: boolean = false;
    //_destroying: boolean = false;
    _navigator: VDialogNavigator | undefined;
    _windows: Window_Base[] = [];
    private _activeWindow: Window_Base | undefined;
    //_resultCallback: DialogResultCallback | undefined;  // deprecated
    //_dialogResult: boolean = false;
    _closing: boolean = false;

    protected constructor(model: SDialog) {
        this.model = model;
    }

    public get scene(): Scene_Base {
        return SceneManager._scene;
    }

    protected dialogContext(): SDialogContext {
        return MRSystem.dialogContext;
    }

    protected commandContext(): SCommandContext {
        return this.dialogContext().commandContext();
    }

    // NOTE: maindialog
    //protected openSubDialog(dialog: REDialog, result: LDialogResultCallback) {
    /** @deprecated use SDialog.openSubDialog */
    protected openSubDialog<T extends SDialog>(dialog: T, onResult: (model: T) => boolean) {
        dialog._resultCallbackVisual = (model: T) => {
            const handled = onResult(model);
            if (!handled) {
                switch (model.resultAction) {
                    case SDialogAction.Submit:
                        this.submit();
                        break;
                    case SDialogAction.Cancel:
                        //this.cancel();
                        break;
                    case SDialogAction.CloseAllSubDialogs:
                        if (MRSystem.dialogContext.dialogs().length >= 2) {
                            this.closeAllSubDialogs();
                        }
                        break;
                }
            }
        }
        MRSystem.dialogContext.open(dialog);
    }
    
    //protected push<T extends VDialog>(dialog: T, result: (model: T) => void) {
    //    dialog._resultCallback = result;
    //    REVisual.manager?._dialogNavigator.push(dialog);
    //}

    protected submit() {
        //this._dialogResult = true;
        this.model.submit();
        //REVisual.manager?._dialogNavigator.pop();

        //if (this._resultCallback) {
        //    this._resultCallback(this);
       // }
    }

    protected cancel() {
        //this._dialogResult = false;
        this.model.cancel();
        //REVisual.manager?._dialogNavigator.pop();
    }

    protected closeAllSubDialogs() {
        this.model.closeAllSubDialogs();
    }

    // push されたあと、最初の onUpdate の前
    onCreate() {

    }

    // push または Sub が pop されてアクティブになった時
    onStart() {
        if (this._activeWindow) {
            this._activeWindow.activate();
        }
    }

    onUpdate() {

    }

    onClose() {
        
    }

    // SubDialog が push されたとき
    onStop() {
        if (this._activeWindow) {
            this._activeWindow.deactivate();
        }
    }

    onDestroy() {
    }

    public get windowLayer(): PIXI.Container {
        return this.scene._windowLayer as any;
    }

    protected addWindow(window: Window_Base) {
        this.scene.addWindow(window);
        this._windows.push(window);
    }

    private _removeWindow(window: Window_Base) {
        const windowLayer = this.scene._windowLayer as any;
        windowLayer.removeChild(window);
    }

    protected activateWindow(window: Window_Base): void {
        if (this._activeWindow) {
            this._activeWindow.deactivate();
        }
        this._activeWindow = window;
        if (this._activeWindow) {
            this._activeWindow.activate();
        }
    }

    _destroy() {
        this.onDestroy();
        this._windows.forEach(x => {
            this._removeWindow(x);
            x.destroy();
        });
    }
}
