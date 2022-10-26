import { DSequelId } from "./DSequel";

export class DSound implements IDataSound {
    name: string;
    pan: number;
    pitch: number;
    volume: number;

    constructor(options: ISound) {
        this.name = options.name;
        this.pan = options.pan ?? 0;
        this.pitch = options.pitch ?? 100;
        this.volume = options.volume ?? 90;
    }
}

export interface ISound {
    name: string;
    pan?: number;
    pitch?: number;
    volume?: number;
}

export class DFlavorEffect {
    /** ログ表示テキスト (%1=self, %2=パラメータ名, %3=変化量の絶対値, %4=古い値, %5=新しい値) */
    public text: string[];

    /** 再生する効果音 */
    public sound: DSound | undefined;

    /** 再生するアニメーションの ID */
    public rmmzAnimationId: number;
    
    /** 再生するモーションの ID */
    public motionId: DSequelId;

    public constructor(options?: IFlavorEffectProps) {
        options = options || {};
        if (options.text === undefined) {
            this.text = [];
        }
        else if (options.text instanceof Array) {
            this.text = options.text;
        }
        else {
            this.text = [options.text];
        }
        this.sound = options.sound ? new DSound(options.sound) : undefined;
        this.rmmzAnimationId = options.animationId ?? 0;
        this.motionId = options.motionId ?? 0;
    }

    // utility
    public static fromRmmzAnimationId(rmmzAnimationId: number): DFlavorEffect {
        const result = new DFlavorEffect();
        result.rmmzAnimationId = rmmzAnimationId;
        return result;
    }
}

export interface IFlavorEffectProps {
    /** ログ表示テキスト (%1=self, %2=パラメータ名, %3=変化量の絶対値, %4=古い値, %5=新しい値) */
    text?: string | string[] | undefined;

    /** 再生する効果音 */
    sound?: ISound | undefined;

    /** 再生するアニメーションの ID */
    animationId?: number;
    
    /** 再生するモーションの ID */
    motionId?: DSequelId;
}

