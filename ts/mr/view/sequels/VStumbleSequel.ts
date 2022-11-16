import { Vector2 } from "ts/mr/math/Vector2";
import { VKeyFrameAnimationCurve } from "../animation/VAnimation";
import { VSequel } from "../VSequel";
import { VSequelContext } from "../VSequelContext";
import { VEntity } from "../VEntity";


export class VStumbleSequel extends VSequel {

    private static RotationSignTable = [1, -1, 1, 1, -1, 1, 1, -1, -1, 1];
    private _curve: VKeyFrameAnimationCurve;

    public constructor() {
        super();
        this._curve = new VKeyFrameAnimationCurve();
        this._curve.addFrame(0, 0);
        this._curve.addFrame(2, Math.PI / 6);
        this._curve.addFrame(20, 0);
    }

    onUpdate(visual: VEntity, context: VSequelContext): void {

        const frameCount = context.frameCount();
        const sprite = visual.rmmzSprite();
        if (!sprite) return;

        if (frameCount == 0) {
            AudioManager.playSe({name: "Damage3", volume: 90, pitch: 100, pan: 0});
        }

        sprite.rotation = this._curve.evaluate(frameCount) * VStumbleSequel.RotationSignTable[visual.entity().dir];

        
        if (frameCount > 60) {
            sprite.rotation = 0;
            visual.resetPosition();
            context.end();
        }
    }
}


