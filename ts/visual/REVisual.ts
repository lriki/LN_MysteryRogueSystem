import { assert } from "ts/Common";
import { REEntityVisualSet } from "./REEntityVisualSet";
import { REVisual_Manager } from "./REVisual_Manager";
import { VChallengeResultWindow } from "./windows/VChallengeResultWindow";

/**
 * 
 * 
 * Scene_Map と 1:1 で存在する。
 * 他プラグインとの競合対策や Scene_Map の拡張による複雑化防止のため、
 * REシステムとして Scene_Map に持たせるべき情報 (Window など) も
 */
export class REVisual
{
    static scene: Scene_Map;
    static manager: REVisual_Manager | undefined;
    static entityVisualSet: REEntityVisualSet | undefined;
    static spriteset: Spriteset_Map | undefined;
    

    static _challengeResultWindow: VChallengeResultWindow;// = new VChallengeResultWindow(rect);

    static initialize(scene: Scene_Map) {
        this.finalize();
        this.scene = scene;
        this.manager = new REVisual_Manager();

    }

    static createWindows() {
        this._challengeResultWindow = new VChallengeResultWindow();
        this.scene.addWindow(this._challengeResultWindow);
    }

    static finalize() {
        if (this.manager) {
            this.manager._finalize();
            this.manager = undefined;
        }
    }
}

