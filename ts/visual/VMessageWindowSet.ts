import { REGame } from "ts/objects/REGame";
import { VHudWindow } from "./VHudWindow";
import { VFloorNameWindow } from "./windows/VFloorNameWindow";
import { VMessageLogWindow } from "./windows/VMessageLogWindow";
import { VMessageWindow } from "./windows/VMessageWindow";


/**
 * Scene_Message 相当の機能。
 * 
 * Scene_Map をオーバーライドして実装すると他プラグインと衝突するための名前調整など小細工が要ることが多いので、こちらにまとめている。
 */
export class VMessageWindowSet {

    private _scene: Scene_Map;
    
    private _hudSpriteSet: VHudWindow;

    private _logWindow: VMessageLogWindow;
    private _messageWindow: VMessageWindow;

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

        this._hudSpriteSet = new VHudWindow();
        this._scene.addWindow(this._hudSpriteSet);


        this._shadowBitmap = new Bitmap(32, 32);
        this._shadowBitmap.fillAll("black");
        this._shadowSprite = new Sprite(this._shadowBitmap);
        this._shadowSprite.setFrame(0, 0, 32, 32);
        this._shadowSprite.scale.x = (Graphics.boxWidth / 32) + 1;
        this._shadowSprite.scale.y = (Graphics.boxHeight / 32) + 1;
        scene._spriteset.addChild(this._shadowSprite);

        this._logWindow = new VMessageLogWindow(REGame.messageHistory, this.messageWindowRect());
        this._scene.addWindow(this._logWindow);

        this._messageWindow = new VMessageWindow(REGame.message, this.messageWindowRect());
        this._scene.addWindow(this._messageWindow);

        this._floorNameWindow = new VFloorNameWindow(new Rectangle(0, 0, Graphics.boxWidth, Graphics.boxHeight));
        this._scene.addWindow(this._floorNameWindow);

        
        this._fadeDuration = 0;
        this._fadeOpacity = 0;
        this._fadeSign = 0;

    }

    private calcWindowHeight(numLines: number, selectable: boolean) {
        if (selectable) {
            return Window_Selectable.prototype.fittingHeight(numLines);
        } else {
            return Window_Base.prototype.fittingHeight(numLines);
        }
    }

    private messageWindowRect(): Rectangle {
        const padding = 30;
        const ww = Graphics.boxWidth;
        const wh = this.calcWindowHeight(2, false) + 8;
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
    }

    public update(): void {
        if (this._floorNameWindow.isEffectRunning()) {
            if (this._floorNameWindow.showCount() == 60) {
                console.log("startFadeIn");
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
    }
}

