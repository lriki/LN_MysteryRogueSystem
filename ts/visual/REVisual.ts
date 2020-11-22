import { assert } from "ts/Common";
import { REEntityVisualSet } from "./REEntityVisualSet";
import { REVisual_Manager } from "./REVisual_Manager";
import { VChallengeResultWindow } from "./windows/VChallengeResultWindow";

/**
 * REシステムと RMMZ の橋渡しを行うモジュールのルートクラス。
 * 
 * Game_XXXX モジュールと連携する必要があるため、インスタンスの寿命はグローバル (NewGame のたびに生成)
 * 
 * 普通のプラグインであれば Scene_Map を拡張してそこに持たせるべきな情報もこちらに持たせているが、
 * これは他プラグインとの競合対策や Scene_Map の拡張による複雑化防止のため。
 */
export class REVisual
{
    // グローバルな情報
    static manager: REVisual_Manager | undefined;
    
    // Scene 単位の情報
    static scene: Scene_Map;
    static entityVisualSet: REEntityVisualSet | undefined;
    static spriteset: Spriteset_Map | undefined;
    static _challengeResultWindow: VChallengeResultWindow;// = new VChallengeResultWindow(rect);

    static initialize() {
        this.finalize();
        this.manager = new REVisual_Manager();
    }

    static onSceneChanged(scene: Scene_Map) {
        this.scene = scene;
        
        // createWindows
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

