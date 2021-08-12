import { assert } from "ts/Common";
import { SDialog } from "ts/system/SDialog";
import { RESystem } from "ts/system/RESystem";
import { REVisual } from "../REVisual";
import { DialogResultCallback, REDialogVisualNavigator } from "./REDialogVisual";
import { SDialogContext } from "ts/system/SDialogContext";
import { SCommandContext } from "ts/system/SCommandContext";

export class VDialog {
    private _baseModel: SDialog;
    _created: boolean = false;
    _started: boolean = false;
    _destroying: boolean = false;
    _navigator: REDialogVisualNavigator | undefined;
    _windows: Window_Base[] = [];
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
    protected openSubDialog<T extends SDialog>(dialog: T, result: (model: T) => void) {
        dialog._resultCallback = result;
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

    }

    onUpdate() {

    }

    onClose() {
        
    }

    // SubDialog が push されたとき
    onStop() {

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

    _destroy() {
        this.onDestroy();

        this._windows.forEach(x => {
            x.destroy();
        });

        this._destroying = false;
    }
}
