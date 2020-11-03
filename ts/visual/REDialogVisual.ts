import { assert } from "ts/Common";
import { REGame } from "ts/RE/REGame";
import { RECommandContext } from "ts/system/RECommandContext";
import { REDialogContext } from "../system/REDialog";
import { REVisual } from "./REVisual";

export class REDialogVisualWindowLayer {
    _started: boolean = false;
    _navigator: REDialogVisualNavigator | undefined;
    _windows: Window_Base[] = [];

    protected dialogContext(): REDialogContext {
        return REGame.scheduler._getDialogContext();
    }

    protected commandContext(): RECommandContext {
        return REGame.scheduler.commandContext();
    }

    // SubDialog が push されたとき
    onCreate() {

    }

    // SubDialog が push されたとき
    onStart() {

    }

    onUpdate(context: REDialogContext) {

    }

    onClose() {
        
    }

    // SubDialog が push されたとき
    onStop() {

    }

    // ウィンドウ破棄とかはここで
    onDestroy() {
        this._windows.forEach(x => {
            x.destroy(undefined);
        });
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
    
    protected push(dialog: REDialogVisualWindowLayer) {
        REVisual.manager?._dialogNavigator.push(dialog);
    }

    protected pop() {
        REVisual.manager?._dialogNavigator.pop();
    }

    protected doneDialog(consumeAction: boolean) {
        assert(this._navigator);
        this._navigator.clear();
        return this.dialogContext().closeDialog(consumeAction);
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
        this._nextScene = dialog;
        dialog._navigator = this;

        if (this._scene) {
            this._scene.onStop();
        }
    }
    
    pop(): void {
        this._nextScene = this._dialogs.pop();

        if (this._scene) {
            this._scene.onStop();
        }
    }

    clear(): void {
        if (this._scene) {
            this._scene.onStop();
            this._scene.onClose();
            this._scene.onDestroy();
        }
        if (this._nextScene) {
            this._nextScene.onStop();
            this._nextScene.onClose();
            this._nextScene.onDestroy();
        }
        for (let i = this._dialogs.length - 1; i >= 0; i--) {
            this._dialogs[i].onStop();
            this._dialogs[i].onClose();
            this._dialogs[i].onDestroy();
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
            if (this._scene) {
                this._scene.onDestroy();
            }
            this._scene = this._nextScene;
            this._nextScene = undefined;
            if (this._scene) {
                this._scene.onCreate();
            }
        }
    }

    private updateScene(context: REDialogContext): void {
        if (this._scene) {
            if (this._scene._started) {
                this._scene.onUpdate(context);
            }
            else {
                this._scene._started = true;
                this._scene.onStart();
                this._scene.onUpdate(context);
            }
        }
    }
    

}

