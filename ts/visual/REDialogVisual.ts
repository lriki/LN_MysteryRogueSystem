import { REDialogContext } from "../system/REDialog";

export class REDialogVisualWindowLayer {
    _started: boolean = false;

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

    push(dialog: REDialogVisualWindowLayer): void {
        this._nextScene = dialog;

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

