import { MRLively } from "ts/mr/lively/MRLively";
import { paramUIMode } from "../PluginParameters";
import { VPlayerStatusWindow2 } from "./rules/default/VPartyStatusWindow";
import { VSceneMapView_Default } from "./rules/default/VSceneMapView_Default";
import { VSceneMapView } from "./rules/VSceneMapView";
import { VHudWindow } from "./VHudWindow";
import { VFloorNameWindow } from "./window/windows/VFloorNameWindow";
import { VMessageLogWindow } from "./window/windows/VMessageLogWindow";
import { VWindowHelper } from "./window/VWindowHelper";
import { VMinimapWindow } from "./window/windows/VMinimapWindow";


/**
 * Scene_Message 相当の機能。
 * 
 * Scene_Map をオーバーライドして実装すると他プラグインと衝突するための名前調整など小細工が要ることが多いので、こちらにまとめている。
 */
export class VMessageWindowSet {

    private _scene: Scene_Map;
    private _sceneMapView: VSceneMapView | undefined;
    
    private _hudSpriteSet: VHudWindow | undefined;

    private _logWindow: VMessageLogWindow | undefined;
    //private _messageWindow: VMessageWindow;

    private _minimapWindow: VMinimapWindow;

    // コアスクリプトのフェード機能は Window 全体にも影響する。つまり、黒画面の上に文字だけ出すような演出ができない。
    // そのため黒Spriteで画面を覆うようにすることで独自のフェード処理を実装する。
    private _shadowBitmap: Bitmap;
    private _shadowSprite: Sprite;
    private _fadeDuration: number;
    private _fadeOpacity: number;
    private _fadeSign: number;

    _floorNameWindow: VFloorNameWindow;

    constructor(scene: Scene_Map) {
        this._scene = scene;



        this._shadowBitmap = new Bitmap(32, 32);
        this._shadowBitmap.fillAll("black");
        this._shadowSprite = new Sprite(this._shadowBitmap);
        this._shadowSprite.setFrame(0, 0, 32, 32);
        this._shadowSprite.scale.x = (Graphics.boxWidth / 32) + 1;
        this._shadowSprite.scale.y = (Graphics.boxHeight / 32) + 1;
        //this._shadowSprite.visible = false;
        scene._spriteset.addChild(this._shadowSprite);


        //this._messageWindow = new VMessageWindow(REGame.message, this.messageWindowRect());
        //this._scene.addWindow(this._messageWindow);

        this._floorNameWindow = new VFloorNameWindow(new Rectangle(0, 0, Graphics.boxWidth, Graphics.boxHeight));
        this._scene.addWindow(this._floorNameWindow);


        this._minimapWindow = new VMinimapWindow(new Rectangle(0, VHudWindow.HeaderHeight, Graphics.boxWidth, Graphics.boxHeight));
        this._scene.addWindow(this._minimapWindow);

        //this._scene._windowLayer.addChildAt( this._minimapWindow , 0);

        
        this._fadeDuration = 0;
        this._fadeOpacity = 0;
        this._fadeSign = 0;

        if (paramUIMode.toLowerCase() === "traditional") {
            this._hudSpriteSet = new VHudWindow();
            this._scene.addWindow(this._hudSpriteSet);
            
            this._logWindow = new VMessageLogWindow(MRLively.messageHistory, this.messageWindowRect());
            this._scene.addWindow(this._logWindow);
        }
        else {
            this._sceneMapView = new VSceneMapView_Default(scene);
        }
    }

    private messageWindowRect(): Rectangle {
        const padding = 30;
        const ww = Graphics.boxWidth;
        const wh = VWindowHelper.calcWindowHeight(2, false) + 8;
        const wx = (Graphics.boxWidth - ww) / 2;
        const wy = Graphics.boxHeight - wh;
        return new Rectangle(wx + padding, wy - padding, ww - padding * 2, wh);
    }

    public attemptStartDisplayFloorName(): void {
        if ($gameMap.displayName()) {
            this._fadeDuration = 0;
            this._fadeOpacity = 255;
            this._floorNameWindow.open();
        }
    }
    
    private startFadeIn(): void {
        this._fadeSign = 1;
        this._fadeDuration = 30;
        this._fadeOpacity = 255;
        //this._shadowSprite.visible = true;
    }

    public update(): void {
        if (this._floorNameWindow.isEffectRunning()) {
            if (this._floorNameWindow.showCount() == 60) {
                this.startFadeIn();
            }
        }


        
        if (this._fadeDuration > 0) {
            const d = this._fadeDuration;
            if (this._fadeSign > 0) {
                this._fadeOpacity -= this._fadeOpacity / d;
            } else {
                this._fadeOpacity += (255 - this._fadeOpacity) / d;
            }
            this._fadeDuration--;
        }

        this._shadowSprite.opacity = this._fadeOpacity;

        if (this._sceneMapView) {
            this._sceneMapView.update();
        }
    }
}

