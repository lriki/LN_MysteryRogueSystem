import { assert } from "ts/Common";
import { REDialogContext } from "ts/system/REDialog";
import { RESystem } from "ts/system/RESystem";
import { REVisual } from "../REVisual";
import { DialogResultCallback, REDialogVisualNavigator } from "./REDialogVisual";


export class VSubDialog {
    _created: boolean = false;
    _started: boolean = false;
    _destroying: boolean = false;
    _navigator: REDialogVisualNavigator | undefined;
    _windows: Window_Base[] = [];
    _resultCallback: DialogResultCallback | undefined;

    //protected commandContext(): RECommandContext {
    //    return REGame.scheduler.commandContext();
    //}

    // push されたあと、最初の onUpdate の前
    onCreate() {

    }

    // push または Sub が pop されてアクティブになった時
    onStart() {

    }

    onUpdate(context: REDialogContext) {

    }

    onClose() {
        
    }

    // SubDialog が push されたとき
    onStop() {

    }

    onDestroy() {
    }

    destroy() {
        this.onDestroy();

        this._windows.forEach(x => {
            x.destroy();
        });

        this._destroying = false;
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
    
    protected push(dialog: VSubDialog, result?: DialogResultCallback) {
        dialog._resultCallback = result;
        REVisual.manager?._dialogNavigator.push(dialog);
    }

    protected pop(result?: any) {
        REVisual.manager?._dialogNavigator.pop(result);
    }

    protected doneDialog(consumeAction: boolean) {
        assert(this._navigator);
        this._navigator.clear();
        return RESystem.dialogContext.closeDialog(consumeAction);
    }
}

