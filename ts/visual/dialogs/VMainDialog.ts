import { assert } from "ts/Common";
import { RESystem } from "ts/system/RESystem";
import { REVisual } from "../REVisual";
import { DialogResultCallback, REDialogVisualNavigator } from "./REDialogVisual";
import { VSubDialog } from "./VSubDialog";

export class VMainDialog {
    
    _created: boolean = false;
    _started: boolean = false;
    _destroying: boolean = false;
    _navigator: REDialogVisualNavigator | undefined;
    _windows: Window_Base[] = [];
    _resultCallback: DialogResultCallback | undefined;


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

    _destroy() {
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
    
    protected openSubDialog(dialog: VSubDialog, result?: DialogResultCallback) {
        dialog._resultCallback = result;
        REVisual.manager?._dialogNavigator.push(dialog);
    }

    protected pop(result?: any) {
        REVisual.manager?._dialogNavigator.pop(result);
    }
}
