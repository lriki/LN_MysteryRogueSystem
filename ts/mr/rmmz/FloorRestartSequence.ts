import { REGame } from "../lively/REGame";
import { RESystem } from "../system/RESystem";

enum FloorRestartStep {
    Idle,
    FadeOut,
    Loading,
    FadeIn,
}

export class FloorRestartSequence {
    private static _step = FloorRestartStep.Idle;

    public static isProcessing(): boolean {
        return this._step != FloorRestartStep.Idle || RESystem.requestedRestartFloorItem.hasAny();
    }

    public static update(scene: Scene_Map): void {

        switch (this._step) {
            case FloorRestartStep.Idle: {
                if (RESystem.requestedRestartFloorItem.hasAny()) {
                    // Scene_Load.prototype.executeLoad() のように、DataManager.loadGame() の後にフェードアウトするのはNG。
                    // 暗転前に $gameXXXX が全て復元され、変な位置にプレイヤーが表示されたりしてしまう。
                    scene.fadeOutAll();
                    this._step = FloorRestartStep.FadeOut;
                    console.log("to FadeOut");
                }
                break;
            }
            case FloorRestartStep.FadeOut: {
                console.log("FadeOut");
                if (!scene.isFading()) {
                    console.log("if FadeOut");
                    const savefileId = 0;//$gameSystem.savefileId();
                    DataManager.loadGame(savefileId)
                        .then(() => this.onLoadSuccess(scene))
                        .catch(() => this.onLoadFailure(scene));
                    this._step = FloorRestartStep.Loading;
                }
                break;
            }
            case FloorRestartStep.Loading: {
                break;
            }
            case FloorRestartStep.FadeIn: {
                if (!scene.isFading()) {
                    this._step = FloorRestartStep.Idle;
                }
                break;
            }
            default:
                throw new Error("Unreachable.");
        }
    }

    public static onLoadSuccess(scene: Scene_Map) {
        SceneManager.goto(Scene_Map);
        this._step = FloorRestartStep.FadeIn;

        const item = REGame.world.entity(RESystem.requestedRestartFloorItem);
        item.removeFromParent();
        item.destroy();
        RESystem.requestedRestartFloorItem.clear();
    }

    public static onLoadFailure(scene: Scene_Map) {
        throw new Error("onLoadFailure");
    }
}
