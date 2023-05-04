import { assert } from "../Common";
import { MRData } from "../data";
import { LChronus } from "../lively/LChronus";
import { MRLively } from "../lively/MRLively";
import { VKeyFrameAnimationCurve } from "./animation/VAnimation";

export class VChronus {
    private _timeFrameId: number;
    private _livingTimeRefreshFrameCount: number;
    private _fadeBitmap: Bitmap;
    private _fadeSprite: Sprite;
    private _textBitmap: Bitmap;
    private _textSprite: Sprite;
    private _fadeAnimation: VKeyFrameAnimationCurve;
    private _chronusWindow: VChronusWindow;

    public constructor(scene: Scene_Map) {
        this._timeFrameId = -1;
        this._livingTimeRefreshFrameCount = -1;

        this._fadeBitmap = new Bitmap(32, 32);
        this._fadeBitmap.fillAll("black");
        this._fadeSprite = new Sprite(this._fadeBitmap);
        this._fadeSprite.anchor.x = 0.5;
        this._fadeSprite.anchor.y = 0.5;
        this._fadeSprite.scale.x = Graphics._width / 32;
        this._fadeSprite.scale.y = Graphics._height / 32;
        this._fadeSprite.x = Graphics._width / 2;
        this._fadeSprite.y = Graphics._height / 2;
        this._fadeSprite.opacity = 0;
        scene.addChild(this._fadeSprite);

        this._textBitmap = new Bitmap(Graphics._width, 80);
        this._textSprite = new Sprite(this._textBitmap);
        this._textSprite.anchor.x = 0.5;
        this._textSprite.anchor.y = 0.5;
        this._textSprite.scale.x = Graphics._width / 32;
        this._textSprite.scale.y = Graphics._height / 32;
        this._textSprite.opacity = 0;
        scene.addChild(this._textSprite);
        this._textBitmap.drawText("test", 0, 0, Graphics._width, 80, "center");

        this._fadeAnimation = new VKeyFrameAnimationCurve();
        this._fadeAnimation.addFrame(0, 0);
        this._fadeAnimation.addFrame(60, 255);
        this._fadeAnimation.addFrame(120, 255);
        this._fadeAnimation.addFrame(180, 0);
        
        this._chronusWindow = new VChronusWindow(new Rectangle(0, 0, 200, 60));
        scene.addWindow(this._chronusWindow);
    }

    public update(): void {
        if (!MRData.chronus.enabled) return;

        const chronus = MRLively.chronus;

        if (this._timeFrameId != chronus.currentTimeFrameId) {
            this._timeFrameId = chronus.currentTimeFrameId;
            this.setTint(this._timeFrameId, true);
        }

        if (this._livingTimeRefreshFrameCount < 0) {
            if (chronus.needsLivingTimeFrameRefresh) {
                this._livingTimeRefreshFrameCount = 0;
            }
        }
        else {
            this._fadeSprite.opacity = this._fadeAnimation.evaluate(this._livingTimeRefreshFrameCount);
            this._livingTimeRefreshFrameCount++;

            if (this._livingTimeRefreshFrameCount >= this._fadeAnimation.lastFrameTime()) {
                this._livingTimeRefreshFrameCount = -1;
                chronus.clearLivingTimeFrameRefresh();
            }
        }
    }

    private getEffectDuration(): number {
        return 120;
    }

    private setTint(timeFrameId: number, withEffect: boolean) {
        const info = MRData.chronus.timeTones.find(x => x.timeFrameId == timeFrameId);
        assert(info);
        const tone = [...info.value];
        // if (this.getWeatherTypeId() !== 0) {
        //     tone[0] = tone[0] > 0 ? tone[0] / 7 : tone[0] - 14;
        //     tone[1] = tone[1] > 0 ? tone[1] / 7 : tone[1] - 14;
        //     tone[2] = tone[2] > 0 ? tone[2] / 7 : tone[1] - 14;
        //     tone[3] = tone[3] === 0 ? 68 : tone[3] + 14;
        // }
        $gameScreen.startTint(tone, withEffect ? this.getEffectDuration() : 0);
    };
}

export class VChronusWindow extends Window_Base {
    private _revisionNumber: number;

    public constructor(rect: Rectangle) {
        super(rect);
        this._revisionNumber = 0;
        this.refresh();
    }

    public get chronus(): LChronus  {
        return MRLively.chronus;
    }

    override update(): void {
        super.update();
        if (this._revisionNumber !== this.chronus.revisionNumber) {
            this._revisionNumber = this.chronus.revisionNumber;
            this.refresh();
        }
    }

    public refresh(): void {
        this.contents.clear();
        var width  = this.contents.width;
        var height = this.lineHeight();
        this.contents.drawText(this.chronus.getDisplayText(), 0, 0, width, height, 'left');
    }
}
