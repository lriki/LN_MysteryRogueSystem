import { SDialog, SDialogAction } from "ts/re/system/SDialog";
import { RESystem } from "ts/re/system/RESystem";
import { REDialogVisualNavigator } from "./REDialogVisual";
import { SDialogContext } from "ts/re/system/SDialogContext";
import { SCommandContext } from "ts/re/system/SCommandContext";

export class VDialog {
    private _baseModel: SDialog;
    _created: boolean = false;
    _started: boolean = false;
    _destroying: boolean = false;
    _navigator: REDialogVisualNavigator | undefined;
    _windows: Window_Base[] = [];
    private _activeWindow: Window_Base | undefined;
    //_resultCallback: DialogResultCallback | undefined;  // deprecated
    //_dialogResult: boolean = false;

    protected constructor(model: SDialog) {
        this._baseModel = model;
    }

    protected dialogContext(): SDialogContext {
        return RESystem.dialogContext;
    }

    protected commandContext(): SCommandContext {
        return this.dialogContext().commandContext();
    }

    // NOTE: maindialog
    //protected openSubDialog(dialog: REDialog, result: LDialogResultCallback) {
    /** @deprecated */
    protected openSubDialog<T extends SDialog>(dialog: T, onResult: (model: T) => boolean) {
        dialog._resultCallbackVisual = (model: T) => {
            const handled = onResult(model);
            if (!handled) {
                console.log("model.resultAction", model.resultAction);
                switch (model.resultAction) {
                    case SDialogAction.Submit:
                        this.submit();
                        break;
                    case SDialogAction.Cancel:
                        //this.cancel();
                        break;
                    case SDialogAction.CloseAllSubDialogs:
                        if (RESystem.dialogContext.dialogs().length >= 2) {
                            this.closeAllSubDialogs();
                        }
                        break;
                }
            }
        }
        RESystem.dialogContext.open(dialog);
    }
    
    //protected push<T extends VDialog>(dialog: T, result: (model: T) => void) {
    //    dialog._resultCallback = result;
    //    REVisual.manager?._dialogNavigator.push(dialog);
    //}

    protected submit() {
        //this._dialogResult = true;
        this._baseModel.submit();
        //REVisual.manager?._dialogNavigator.pop();

        //if (this._resultCallback) {
        //    this._resultCallback(this);
       // }
    }

    protected cancel() {
        //this._dialogResult = false;
        this._baseModel.cancel();
        //REVisual.manager?._dialogNavigator.pop();
    }

    protected closeAllSubDialogs() {
        this._baseModel.closeAllSubDialogs();
    }

    //public isSubmitted(): boolean {
    //    return this._dialogResult;
    //}

   // public isCanceled(): boolean {
    //    return !this._dialogResult;
    //}
    
    /*
    protected doneDialog(consumeAction: boolean) {
        assert(this._navigator);
        this._navigator.clear();
        return RESystem.dialogContext.closeDialog(consumeAction);
    }
    */

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

    protected addWindow(window: Window_Base) {
        SceneManager._scene.addWindow(window);
        this._windows.push(window);
    }

    protected removeWindow(window: Window_Base) {
        throw new Error("Not implemented.");
        //const windowLayer = SceneManager._scene._windowLayer as any;
        //windowLayer.removeChild(window);
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
            x.destroy();
        });

        this._destroying = false;
    }
}
