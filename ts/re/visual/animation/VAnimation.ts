import { assert } from "ts/re/Common";
import { TEasing } from "./VEasing";

/** アニメーションの繰り返し方法 */
export enum VAnimationWrapMode {
    /** 繰り返しを行わず、1度だけ再生します。 */
    Once,

    /** 最後まで再生された後、先頭に戻ってループします。 */
    Loop,

    /** 最後まで再生された後、逆方向に戻ってループします。 */
    Alternate,
}

export class VAnimationCurve {
    private _wrapMode: VAnimationWrapMode;

    public constructor() {
        this._wrapMode = VAnimationWrapMode.Once;
    }

	/** 指定した時間における値を評価します。*/
	public evaluate(time: number): number {
        return this.onEvaluate(this.calculateLocalTime(time, this.lastFrameTime(), this._wrapMode));
    }

	/** アニメーションの終端の時間を取得します。 */
	public lastFrameTime(): number {
        return this.onGetLastFrameTime();
    }

	/** アニメーションの繰り返しの動作を取得します。 */
	public wrapMode(): VAnimationWrapMode {
        return this._wrapMode;
    }

	/** アニメーションの繰り返しの動作を設定します。(default: Once) */
	public setWrapMode(mode: VAnimationWrapMode) {
        this._wrapMode = mode;
    }
    
	protected onEvaluate(time: number): number {
        return 0;
    }

	protected onGetLastFrameTime(): number {
        return 0;
    }
     
	private calculateLocalTime(time: number, duration: number, wrapMode: VAnimationWrapMode): number {
        let localTime = 0.0;
        switch (wrapMode) {
        case VAnimationWrapMode.Once:
            localTime = Math.min(time, duration);
            break;
        case VAnimationWrapMode.Loop:
            localTime = time % duration;
            break;
        case VAnimationWrapMode.Alternate:
        {
            const freq = duration * 2;
            const t = (time % freq);
            const phase = t / freq;
            if (phase <= 0.5) {
                localTime = t;
            }
            else {
                localTime = freq - t;
            }
            break;
        }
        default:
            throw new Error("Unreachable.");
        }
        return localTime;
    }
}

export class VEasingAnimationCurve extends VAnimationCurve {
	_startValue: number;
	_targetValue: number;
	_duration: number;
	_func: TEasing;

    public constructor(startValue: number, targetValue: number, duration: number, func: TEasing) {
        super();
        this._startValue = startValue;
        this._targetValue = targetValue;
        this._duration = duration;
        this._func = func;
    }

	protected onEvaluate(time: number): number {
        const t = this._func(time / this._duration);
        return (this._targetValue - this._startValue) * t + this._startValue;
    }

	protected onGetLastFrameTime(): number {
        return this._duration;
    }
}

export class VAnimationInstance {
    //container: PIXI.Container;
    key: string;
    curve: VAnimationCurve;
    setter: (v: number) => void;
    time: number;

    constructor(/*container: PIXI.Container,*/ key: string, curve: VAnimationCurve, setter: (v: number) => void) {
        //this.container = container;
        this.key = key;
        this.curve = curve;
        this.setter = setter;
        this.time = 0;
    }

    public update(elapsedTime: number): void {
        this.time += elapsedTime;
        const value = this.curve.evaluate(this.time);
        this.setter(value);
    }

    public isFinished(): boolean {
        if (this.curve.wrapMode() == VAnimationWrapMode.Once) {
            return this.time >= this.curve.lastFrameTime();
        }
        else {
            return false;
        }
    }
}

export class VAnimation {
    //private static _animations: VAnimationInstance[] = [];
    private static _containers: PIXI.Container[] = []; 

    public static start(container: PIXI.Container, key: string, curve: VAnimationCurve, setter: (v: number) => void): void {
        const instance = new VAnimationInstance(/*container,*/ key, curve, setter);
        this.add(container, key, instance);
    }

    public static add(container_: PIXI.Container, key: string, instance: VAnimationInstance): void {
        const container = container_ as any;
        if (container._animations_RE) {
            container._animations_RE = [];
        }
        const animations = container._animations_RE;
        assert(animations);

        // 同一 key があればそこへ上書き設定
        for (let i = 0; i < animations.length; i++) {
            if (animations[i].key == key) {
                animations[i] = instance;
                return;
            }
        }

        // 無ければ新しく追加
        animations.push(instance);
    }

    public static stop(container_: PIXI.Container, key: string): void {
        const container = container_ as any;
        if (container._animations_RE) {
            const animations = container._animations_RE;
            for (let i = animations.length - 1; i >= 0; i--) {
                if (animations[i].key == key) {
                    animations.splice(i, 1);
                }
            }
        }
    }

    public static stopAll(container_: PIXI.Container): void {
        const container = container_ as any;
        if (container._animations_RE) {
            container._animations_RE = [];
        }
    }

    public static update(): void {
        const elapsedTime = 0.016;

        for (const container of this._containers) {
            const animations = (container as any)._animations_RE;
            if (animations) {
                for (const instance of animations) {
                    instance.update(elapsedTime);
                }
            }
        }

        this.refresh();
    }

    private static refresh(): void {
        for (let i = this._containers.length - 1; i >= 0; i--) {
            // この container のアニメーションはすべて終了している？
            let allFin = true;
            const animations = (this._containers[i] as any)._animations_RE;
            if (animations) {
                for (const instance of animations) {
                    if (!instance.isFinished()) {
                        allFin = false;
                        break;
                    }
                }
            }

            // 更新対象から取り除く
            if (allFin) {
                this._containers.splice(i, 1);
            }
        }
    }
}


// declare namespace PIXI { 
//     interface Container {
//         _animations_RE: (VAnimationInstance[] | undefined);
//     }
// }



// declare global {
//     interface Window {
//         _animationClocks_RE: (VAnimationInstance[] | undefined);
//     }
// }

const _PIXI_Container_prototype_destroy = PIXI.Container.prototype.destroy;
PIXI.Container.prototype.destroy = function(options?: {
    children?: boolean;
    texture?: boolean;
    baseTexture?: boolean;
}) {
    VAnimation.stopAll(this);
    _PIXI_Container_prototype_destroy.call(this, options);
};
