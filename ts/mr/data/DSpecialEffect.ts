import { DSpecialEffectId } from "./DCommon";
import { DEntityId } from "./DEntity";
import { MRData } from "./MRData";


export class DSpecialEffect {
    public readonly id: DSpecialEffectId;
    public readonly key: string;

    public constructor(id: DSpecialEffectId, key: string) {
        this.id = id;
        this.key = key;
    }

    public static makeSpecialEffectRef(props: ISpecialEffectProps): DSpecialEffectRef {
        const id = MRData.getSpecialEffect(props.code).id;
        switch (props.code) {
            case "RandomWarp":
                return { specialEffectId: id, entityId: 0, dataId: 0, value: 0 };
            case "AddState":
                return { specialEffectId: id, entityId: 0, dataId: MRData.getState(props.stateKey).id, value: props.chance };
            case "RemoveState":
                return { specialEffectId: id, entityId: 0, dataId: MRData.getState(props.stateKey).id, value: props.chance };
            case "Unknown":
                return { specialEffectId: id, entityId: 0, dataId: props.dataKey, value: props.value };
            default:
                throw new Error(`SpecialEffect code "${(props as any).code}" unsupported.`)
        }
    }
}

export interface DSpecialEffectRef {
    specialEffectId: DSpecialEffectId;
    entityId: DEntityId;
    dataId: number;
    value: number;
}

//------------------------------------------------------------------------------
// Props

export interface ISpecialEffectProps_RandomWarp {
    code: "RandomWarp";
}

/** ステート付加 */
export interface ISpecialEffectProps_AddState {
    code: "AddState";

    /** ステートの Key. */
    stateKey: string;

    /** 成功率 (1.0 は 100%) */
    chance: number;

    // NOTE: Naming, rate vs chance
    // コアスクリプト内で chance という単語は、この AddState, RemoveState のみ使われている。
    // rate という単語は広範に使われていて、値の範囲も様々。
    // - 敵の行動レートは 1~9
    // - xparam(回避率など) は 0.0~1.0
    // - 逃走率は 0.0~1.0
}

export interface ISpecialEffectProps_RemoveState {
    /** ステート解除 */
    code: "RemoveState";

    /** ステートの Key. */
    stateKey: string;

    /** 成功率 (1.0 は 100%) */
    chance: number;
}

export interface ISpecialEffectProps_Unknown {
    code: "Unknown";
    dataKey: any;
    value: any;
}

export type ISpecialEffectProps =
    ISpecialEffectProps_RandomWarp |
    ISpecialEffectProps_AddState |
    ISpecialEffectProps_RemoveState |
    ISpecialEffectProps_Unknown;

