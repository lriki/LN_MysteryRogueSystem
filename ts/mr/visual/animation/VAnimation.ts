import { assert } from "ts/mr/Common";
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

export enum VKeyFrameTangentMode {
	/** 線形補間 */
	Linear,

	/** 接線 (速度) を使用した補間 (エルミートスプライン) */
	Tangent,

	/** キーフレームの値を通過するなめらかな補間 (Catmull-Rom) */
	Auto,

	/** 補間なし */
	Constant,
}

export interface VKeyFrame {
	/** 時間 */
	time: number;

	/** 値 */
	value: number;

	/** 前のキーフレームとの補間方法 */
	leftTangentMode: VKeyFrameTangentMode;

	/** 前のキーフレームからこのキーフレームに近づくときの接線 */
	leftTangent: number;

	/** 次のキーフレームとの補間方法 */
	rightTangentMode: VKeyFrameTangentMode;

	/** このキーフレームから次のキーフレームに向かうときの接線 */
	rightTangent: number;
}

export class VKeyFrameAnimationCurve extends VAnimationCurve {
    private _keyFrames: VKeyFrame[];
    private _defaultValue: number;

    public constructor() {
        super();
        this._keyFrames = [];
        this._defaultValue = 0.0;
    }

	public addKeyFrame(keyFrame: VKeyFrame): void {
        // そのまま追加できる
        if (this._keyFrames.isEmpty() || this._keyFrames.back().time <= keyFrame.time) {
            this._keyFrames.push(keyFrame);
        }
        // 追加後のソートが必要
        else {
            throw new Error("Not implemetend.");
        }
    }

    public addFrame(time: number, value: number, rightTangentMode = VKeyFrameTangentMode.Linear, tangent: number = 0.0): this {

        const k: VKeyFrame  = {
            time: time,
            value: value,
            leftTangentMode: VKeyFrameTangentMode.Constant,
            leftTangent: 0.0,
            rightTangentMode: rightTangentMode,
            rightTangent: tangent,
        };
    
        if (!this._keyFrames.isEmpty() && this._keyFrames.front().time <= time) {
            const ikey0 = this.findKeyFrameIndex(time);
            assert(ikey0 >= 0);
            const key0 = this._keyFrames[ikey0];
            k.leftTangentMode = key0.rightTangentMode;
            k.leftTangent = -key0.rightTangent;
        }
        else {
            k.leftTangentMode = VKeyFrameTangentMode.Constant;
            k.leftTangent = 0.0;
        }
    
        this.addKeyFrame(k);
        return this;
    }
    

	onEvaluate(time: number): number {
        if (this._keyFrames.length == 0) {
            return this._defaultValue;
        }
        // time が最初のフレーム位置より前の場合は Clamp
        if (time < this._keyFrames.front().time) {
            return this._keyFrames.front().value;
        }
        // キーがひとつだけの場合はそのキーの値
        else if (this._keyFrames.length == 1) {
            return this._keyFrames.front().value;
        }
        // time が終端以降の場合は終端の値
        else if (time >= this._keyFrames.back().time) {
            return this._keyFrames.back().value;
        }
        // 以上以外の場合は補間する
        else
        {
            const ikey0 = this.findKeyFrameIndex(time);
            const key0 = this._keyFrames[ikey0];
            const key1 = this._keyFrames[ikey0 + 1];
    
            const p0 = key0.value;
            const p1 = key1.value;
            const t0 = (key0.time);
            const t1 = (key1.time);
            const t = (time - t0) / (t1 - t0);
    
            // まず2種類のモードで保管する。最後にそれらを t で線形補間することで、異なる TangentMode を補間する
            const modes = [key0.rightTangentMode, key1.leftTangentMode];
            const values = [0, 0];
            for (let i = 0; i < 2; i++)
            {
                switch (modes[i])
                {
                // 補間無し
                case VKeyFrameTangentMode.Constant:
                {
                    values[i] = p0;
                    break;
                }
                // 線形
                case VKeyFrameTangentMode.Linear:
                {
                    values[i] = p0 + (p1 - p0) * t;
                    break;
                }
                // 三次補間
                case VKeyFrameTangentMode.Tangent:
                {
                    values[i] = this.hermite(
                        p0, key0.rightTangent,
                        p1, key1.leftTangent,
                        t);
                    break;
                }
                // Catmull-Rom
                case VKeyFrameTangentMode.Auto:
                {
                    // ループ再生で time が終端を超えている場合、
                    // この時点でkey の値は ループ開始位置のひとつ前のキーを指している
    
                    const begin = this._keyFrames.front();
                    const end = this._keyFrames.back();
    
                    // この補間には、begin のひとつ前と end のひとつ後の値が必要。
                    // それぞれが始点、終点の場合はループするように補間する
                    values[i] = this.catmullRom(
                        ((key0.time == begin.time) ? end.value : this._keyFrames[ikey0 - 1].value),
                        p0,
                        p1,
                        ((key1.time == end.time) ? begin.value : this._keyFrames[ikey0 + 2].value),
                        t);
                    break;
                }
                }
            }
    
            return values[0] + (values[1] - values[0]) * t;
        }
    }

	onGetLastFrameTime(): number {
        if (this._keyFrames.length == 0) return 0.0;
        return this._keyFrames[this._keyFrames.length - 1].time;
    }

    private findKeyFrameIndex(time: number): number {
        // TODO: 二分探索
        for (let i = this._keyFrames.length - 1; i >= 0; i--) {
            if (this._keyFrames[i].time <= time) {
                return i;
            }
        }
        return -1;
    }
    
    private hermite(v1: number, a1: number, v2: number, a2: number, t: number): number {
        const a = 2.0 * (v1 - v2) + (a1 + a2);
        const b = 3.0 * (v2 - v1) - (2.0 * a1) - a2;
        let r = a;
        r *= t;
        r += b;
        r *= t;
        r += a1;
        r *= t;
        return r + v1;
    }

    private catmullRom(v1: number, v2: number, v3: number, v4: number, t: number): number {
        const d1 = (v3 - v1) * 0.5;
        const d2 = (v4 - v2) * 0.5;
        return (2.0 * v2 - 2.0 * v3 + d1 + d2) * t * t * t + (-3.0 * v2 + 3.0 * v3 - 2.0 * d1 - d2) * t * t + d1 * t + v2;
    }

}


export class VAnimationInstance {
    //container: PIXI.Container;
    key: string;
    curve: VAnimationCurve;
    setter: (v: number) => void;
    time: number;
    //timeOffset: number;
    _then: (() => void) | undefined;

    constructor(/*container: PIXI.Container,*/ key: string, curve: VAnimationCurve, setter: (v: number) => void) {
        //this.container = container;
        this.key = key;
        this.curve = curve;
        this.setter = setter;
        this.time = 0;
        //this.timeOffset = 0;
    }

    public update(elapsedTime: number): void {
        const oldFinished = this.isFinished();
        this.time += elapsedTime;
        const value = this.curve.evaluate(/*this.timeOffset + */this.time);
        this.setter(value);

        if (this._then) {
            const afterFinished = this.isFinished();
            if (afterFinished && oldFinished != afterFinished) {
                this._then();
            }
        }
    }

    public isFinished(): boolean {
        if (this.curve.wrapMode() == VAnimationWrapMode.Once) {
            return this.time >= this.curve.lastFrameTime();
        }
        else {
            return false;
        }
    }

    public then(func: () => void): void {
        this._then = func;
    }
}

export class VAnimation {
    //private static _animations: VAnimationInstance[] = [];
    private static _containers: PIXI.Container[] = []; 

    public static start(container: PIXI.Container, key: string, curve: VAnimationCurve, setter: (v: number) => void, timeOffset: number = 0.0): VAnimationInstance {
        const instance = new VAnimationInstance(/*container,*/ key, curve, setter);
        //instance.timeOffset = timeOffset;
        instance.time += timeOffset;
        this.add(container, key, instance);
        return instance;
    }

    /**
     * start に対してこちらは現在値を始点とした相対的なアニメーションを表現するのに使用する。
     */
    public static startAt(container: PIXI.Container, key: string, start: number, target: number, duration: number, curve: TEasing, setter: (v: number) => void, timeOffset: number = 0.0): VAnimationInstance {
        const instance = new VAnimationInstance(/*container,*/ key, new VEasingAnimationCurve(start, target, duration, curve), setter);
        //instance.timeOffset = timeOffset;
        instance.time += timeOffset;
        this.add(container, key, instance);
        return instance;
    }

    public static add(container_: PIXI.Container, key: string, instance: VAnimationInstance): void {
        const container = container_ as any;
        if (!container._animations_RE) {
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
        
        if (!this._containers.includes(container)) {
            this._containers.push(container);
        }
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
            this._containers.mutableRemoveAll(x => x == container);
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
                // for (const instance of animations) {
                //     if (!instance.isFinished()) {
                //         allFin = false;
                //         break;
                //     }
                // }
                for (let iInst = animations.length - 1; iInst >= 0; iInst--) {
                    if (animations[iInst].isFinished()) {
                        animations.splice(iInst, 1);
                    }
                    else {
                        allFin = false;
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
