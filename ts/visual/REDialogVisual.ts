import { assert } from "ts/Common";
import { REGame } from "ts/objects/REGame";
import { RECommandContext } from "ts/system/RECommandContext";
import { RESystem } from "ts/system/RESystem";
import { REDialogContext } from "../system/REDialog";
import { REVisual } from "./REVisual";

export type DialogResultCallback = (result: any) => void;

export class REDialogVisualWindowLayer {
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
        console.log("destroy", this);
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
    
    protected push(dialog: REDialogVisualWindowLayer, result?: DialogResultCallback) {
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

/**
 * SceneManager と同じく、スタックで Sub Dialog を管理するクラス。
 * 
 * SceneManager でメニュー表示などを実装すると、ウィンドウが表示されたときには Scene_Map の表示情報はすべて破棄されている。
 * そのため、ウィンドウを表示したままキャラクターをアニメーションさせることができない。
 * 
 * このクラスはその対策として、Scene_Map 内でウィンドウの遷移管理を行う。
 */
export class REDialogVisualNavigator {
    _dialogs: REDialogVisualWindowLayer[];
    _scene: REDialogVisualWindowLayer | undefined;
    _nextScene: REDialogVisualWindowLayer | undefined;

    constructor() {
        this._dialogs = [];
    }

    isEmpty(): boolean {
        return !this._scene && !this._nextScene && this._dialogs.length == 0;
    }

    push(dialog: REDialogVisualWindowLayer): void {
        if (this._scene) {
            this._dialogs.push(this._scene);
        }

        this._nextScene = dialog;
        dialog._navigator = this;

        if (this._scene) {
            this._scene.onStop();
        }
    }
    
    pop(result?: any): void {
        this._nextScene = this._dialogs.pop();

        if (this._scene) {
            this._scene.onStop();
            this._scene._destroying = true;
        }

        if (this._nextScene && this._nextScene._resultCallback) {
            this._nextScene._resultCallback(result);
        }
    }

    clear(): void {
        if (this._scene) {
            this._scene.onStop();
            this._scene.onClose();
            this._scene.destroy();
        }
        if (this._nextScene) {
            this._nextScene.onStop();
            this._nextScene.onClose();
            this._nextScene.destroy();
        }
        for (let i = this._dialogs.length - 1; i >= 0; i--) {
            this._dialogs[i].onStop();
            this._dialogs[i].onClose();
            this._dialogs[i].destroy();
        }
        this._dialogs = [];
        this._scene = undefined;
        this._nextScene = undefined;
    }

    update(context: REDialogContext): void {
        this.changeScene();
        this.updateScene(context);
    }

    private changeScene(): void {
        if (this._nextScene) {
            if (this._scene && this._scene._destroying) {
                this._scene.destroy();
            }
            this._scene = this._nextScene;
            this._nextScene = undefined;
            if (this._scene) {
                if (!this._scene._created) {
                    this._scene.onCreate();
                    this._scene._created = true;
                }
                this._scene.onStart();
            }
        }
    }

    private updateScene(context: REDialogContext): void {
        if (this._scene) {
            this._scene.onUpdate(context);
            /*
            if (this._scene._started) {
                this._scene.onUpdate(context);
            }
            else {
                this._scene._started = true;
                this._scene.onStart();
            }
            */
        }
    }
    

}

