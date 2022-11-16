import { VMapEditor } from "ts/mr/rmmz/VMapEditor";
import { VAnimation } from "./animation/VAnimation";
import { VEntityManager } from "./VEntityManager";
import { MRVisualExtension } from "./MRVisualExtension";
import { VSequelFactory } from "./VSequelFactory";
import { VMapGuideGrid } from "./VMapGuideGrid";
import { VMessageWindowSet } from "./VMessageWindowSet";
import { VSpriteSet } from "./VSpriteSet";
import { VChallengeResultWindow } from "./windows/VChallengeResultWindow";
import { VChronus } from "./VChronus";
import { VDialogManager } from "./VDialogManager";

/**
 * REシステムと RMMZ の橋渡しを行うモジュールのルートクラス。
 * 
 * Game_XXXX モジュールと連携する必要があるため、インスタンスの寿命はグローバル (NewGame のたびに生成)
 * 
 * 普通のプラグインであれば Scene_Map を拡張してそこに持たせるべきな情報もこちらに持たせているが、
 * これは他プラグインとの競合対策や Scene_Map の拡張による複雑化防止のため。
 */
export class MRView {
    // グローバルな情報
    static ext: MRVisualExtension = new MRVisualExtension();
    static sequelFactory: VSequelFactory | undefined;
    static dialogManager: VDialogManager | undefined;
    static mapBuilder: VMapEditor | undefined;
    static chronus: VChronus | undefined;
    
    // Scene 単位の情報
    static scene: Scene_Map;
    static entityVisualSet: VEntityManager | undefined;
    static spriteset: Spriteset_Map | undefined;
    static _challengeResultWindow: VChallengeResultWindow;
    static _messageWindowSet: VMessageWindowSet;

    static spriteSet2: VSpriteSet | undefined;
    static guideGrid: VMapGuideGrid | undefined;

    static _syncCamera: boolean =true;
    static _playerPosRefreshNeed = false;

    static initialize() {
        this.finalize();
        this.sequelFactory = new VSequelFactory();
        this.dialogManager = new VDialogManager();
    }

    static onSceneChanged(scene: Scene_Map) {
        this.scene = scene;
        
        // createWindows
        this._challengeResultWindow = new VChallengeResultWindow();
        this.scene.addWindow(this._challengeResultWindow);

        this._messageWindowSet = new VMessageWindowSet(scene);
        this.guideGrid = new VMapGuideGrid();
        this.chronus = new VChronus(scene);

        this.ext.onMapVisualSetup();
    }

    static finalize() {
        this.sequelFactory = undefined;
        this.dialogManager = undefined;
    }

    static update() {
        this.entityVisualSet?.update();
        this.guideGrid?.update();
        this._messageWindowSet?.update();
        VAnimation.update();
        this.dialogManager?.dialogNavigator.lateUpdate();
        this.chronus?.update();
    }
}

