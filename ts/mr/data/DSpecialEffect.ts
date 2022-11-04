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
                return { specialEffectId: id };
            case "Unknown":
                return { specialEffectId: id, dataId: props.dataKey, value: props.value };
            default:
                throw new Error(`SpecialEffect code "${(props as any).code}" unsupported.`)
        }
    }
}

export interface DSpecialEffectRef {
    specialEffectId: DSpecialEffectId;
    entityId?: DEntityId;
    dataId?: number;
    value?: any;
}

//------------------------------------------------------------------------------
// Props

export interface ISpecialEffectProps_RandomWarp {
    code: "RandomWarp";
}

export interface ISpecialEffectProps_Unknown {
    code: "Unknown";
    dataKey: any;
    value: any;
}

export type ISpecialEffectProps =
    ISpecialEffectProps_RandomWarp |
    ISpecialEffectProps_Unknown;

