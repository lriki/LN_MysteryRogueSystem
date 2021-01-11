import { assert } from "ts/Common";
import { REGame } from "ts/objects/REGame";
import { RECommandContext } from "ts/system/RECommandContext";
import { RESystem } from "ts/system/RESystem";
import { REDialogContext } from "../../system/REDialog";
import { REVisual } from "../REVisual";
import { VDialog } from "./VDialog";
import { VMainDialog } from "./VMainDialog";
import { VSubDialog } from "./VSubDialog";

export type DialogResultCallback = (result: any) => void;

/**
 * SceneManager と同じく、スタックで Sub Dialog を管理するクラス。
 * 
 * SceneManager でメニュー表示などを実装すると、ウィンドウが表示されたときには Scene_Map の表示情報はすべて破棄されている。
 * そのため、ウィンドウを表示したままキャラクターをアニメーションさせることができない。
 * 
 * このクラスはその対策として、Scene_Map 内でウィンドウの遷移管理を行う。
 */
export class REDialogVisualNavigator {
    _subDialogs: VDialog[];
    _scene: VDialog | undefined;
    _nextScene: VDialog | undefined;

    constructor() {
        this._subDialogs = [];
    }

    isEmpty(): boolean {
        return !this._scene && !this._nextScene && this._subDialogs.length == 0;
    }

    _openMainDialog(dialog: VMainDialog): void {
        assert(this.isEmpty());
        this.push(dialog);
    }

    _openSubDialog(dialog: VSubDialog): void {
        assert(!this.isEmpty());
        this.push(dialog);
    }

    push(dialog: VDialog): void {
        if (this._scene) {
            this._subDialogs.push(this._scene);
        }

        this._nextScene = dialog;
        dialog._navigator = this;

        if (this._scene) {
            this._scene.onStop();
        }
    }
    
    pop(submit: boolean, result?: any): void {
        this._nextScene = this._subDialogs.pop();

        if (this._scene) {
            this._scene.onStop();
            this._scene._destroying = true;

            if (submit && this._scene._resultCallback) {
                this._scene._resultCallback(result);
            }
        }

    }

    clear(): void {
        if (this._scene) {
            this._scene.onStop();
            this._scene.onClose();
            this._scene._destroy();
        }
        if (this._nextScene) {
            this._nextScene.onStop();
            this._nextScene.onClose();
            this._nextScene._destroy();
        }
        for (let i = this._subDialogs.length - 1; i >= 0; i--) {
            this._subDialogs[i].onStop();
            this._subDialogs[i].onClose();
            this._subDialogs[i]._destroy();
        }
        this._subDialogs = [];
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
                this._scene._destroy();
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
            this._scene.onUpdate();
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
