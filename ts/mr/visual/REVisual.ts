import { VMapEditor } from "ts/mr/rmmz/VMapEditor";
import { VAnimation } from "./animation/VAnimation";
import { REEntityVisualSet } from "./REEntityVisualSet";
import { REVisualExtension } from "./REVisualExtension";
import { REVisual_Manager } from "./REVisual_Manager";
import { VMapGuideGrid } from "./VMapGuideGrid";
import { VMessageWindowSet } from "./VMessageWindowSet";
import { VSpriteSet } from "./VSpriteSet";
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
    static ext: REVisualExtension = new REVisualExtension();
    static manager: REVisual_Manager | undefined;
    static mapBuilder: VMapEditor | undefined;
    
    // Scene 単位の情報
    static scene: Scene_Map;
    static entityVisualSet: REEntityVisualSet | undefined;
    static spriteset: Spriteset_Map | undefined;
    static _challengeResultWindow: VChallengeResultWindow;
    static _messageWindowSet: VMessageWindowSet;

    static spriteSet2: VSpriteSet | undefined;
    static guideGrid: VMapGuideGrid | undefined;

    static _syncCamera: boolean =true;
    static _playerPosRefreshNeed = false;

    static initialize() {
        this.finalize();
        this.manager = new REVisual_Manager();
    }

    static onSceneChanged(scene: Scene_Map) {
        this.scene = scene;
        
        // createWindows
        this._challengeResultWindow = new VChallengeResultWindow();
        this.scene.addWindow(this._challengeResultWindow);

        this._messageWindowSet = new VMessageWindowSet(scene);
        this.guideGrid = new VMapGuideGrid();

        this.ext.onMapVisualSetup();
    }

    // static isSyncCoreToVisual(): boolean {
    //     // TODO: 今は対応したい条件が _syncCamera と一致するのでこれでカバーしている。
    //     return this._syncCamera;
    // }

    static finalize() {
        if (this.manager) {
            this.manager._finalize();
            this.manager = undefined;
        }
    }

    static update() {
        this.entityVisualSet?.update();
        this.guideGrid?.update();
        this._messageWindowSet?.update();
        VAnimation.update();
    }
}

