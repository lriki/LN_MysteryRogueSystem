import { tr2 } from "../Common";
import { DElementId } from "./DCommon";
import { DHelpers } from "./DHelper";
import { MRBasics } from "./MRBasics";
import { MRData } from "./MRData";

export type DTraitId = number;

/**
 * コアスクリプトの Trait は number だけで識別されるものであるが、
 * RE としてはメモ欄を使った指定を行う際の名前検索などで Trait というデータ自体に若干属性が必要になる。
 * 
 * NOTE: Behavior と Trait は違うもの？
 * ----------
 * ひとまず、違うものにしてみる。
 * Behavior に対して Trait は静的なデータ。特に単なるフラグを表したい時に使う。
 * よく見え状態、透視状態、ワナ回避状態、ハラヘラズ状態、ワナ師状態、など。
 * ちなみにこれらは、例えばワナ回避状態であれば、そういった状態を処理できるフローは Behavior に実装され、
 * 実際にその条件を通るかは Trait を持っているかどうか、に依る。
 * - Behavior は "資質"
 * - Trait はその資質を発動させる "鍵"
 * みたいに考えるとよさそう。
 * ただ、よく見え状態やワナ師状態などは必ずしも個々のEntityの Behavior だけで解決できるものではない。
 * そういったものモノある点に注意。
 * それでもまぁ、例えば "勢力の資質" とか "パーティの資質" とかで考えるといいかも。
 */
export class DTrait {
    /** ID (0 is Invalid). */
    id: DTraitId;

    /** Key */
    key: string;
    
    public constructor(id: DTraitId, key: string) {
        this.id = id;
        this.key = key;
    }

    /** @deprecated DMetadataParser */
    public static parseTraitMetadata(meta: any): IDataTrait[] {
        const raws = meta["MR-Trait"];
        if (!raws) return [];
        const list = ((raws instanceof Array) ? raws : [raws]) as string[];
        
        const result: IDataTrait[] = [];
        for (const data of list) {
            const c = DHelpers.parseConstructionExpr(data);
            result.push({
                code: MRData.getTrait(c.name).id,
                dataId: this.parseDataId(c.args[0]),
                value: Number(c.args[1]),
            });
        }
        return result;
    }

    private static parseDataId(value: any): number {
        if (typeof value == 'string') {
            // 今のところ Param 名だけなのでそれを検索してみる
            const code = value.toLowerCase();
            const param = MRData.parameters.find(x => x.code == code);
            if (param) {
                return param.id;
            }
            else {
                throw new Error(tr2("Trait に指定されているパラメータ名 %1 は不正です。").format(value));
            }
        }
        else {
            return Number(value);
        }
    }

    public static makeTraitData(props: ITraitProps): IDataTrait {
        switch (props.code) {
            case "DeathVulnerableElement":
                return { code: MRData.getTrait("DeathVulnerableElement").id, dataId: MRData.getElement(props.elementKey).id, value: MRData.getState(props.stateKey).id };
            case "RaceRate":
                return { code: MRBasics.traits.RaceRate, dataId: MRData.getRace(props.raceKey).id, value: props.value };
            case "SurvivalParameterLossRate":
                return { code: MRBasics.traits.SurvivalParamLossRate, dataId: MRData.getParameter(props.parameterKey).id, value: props.value };
            case "ParameterDamageRate":
                return { code: MRBasics.traits.ParamDamageRate, dataId: MRData.getParameter(props.parameterKey).id, value: props.value };
            case "SkillGuard":
                return { code: MRBasics.traits.SkillGuard, dataId: MRData.getSkill(props.skillKey).id, value: 0 };
            case "Unknown":
                return { code: 0, dataId: props.dataKey, value: props.value };
            default:
                throw new Error(`Trait code "${(props as any).code}" unsupported.`)
        }
    }
}

//------------------------------------------------------------------------------
// Props

export interface ITraitProps_DeathVulnerableElement {
    /** DeathVulnerableElement1 */
    code: "DeathVulnerableElement";
    elementKey: string;
    stateKey: string;
}

export interface ITraitProps_RaceRate {
    /** RaceRate1 */
    code: "RaceRate";
    raceKey: string;
    value: number;
}

export interface ITraitProps_SurvivalParameterLossRate {
    /** SurvivalParameterLossRate1 */
    code: "SurvivalParameterLossRate";

    /** パラメータ Key. */
    parameterKey: string;

    /** 率 (double) */
    value: number;
}

export interface ITraitProps_ParameterDamageRate {
    /** ParameterDamageRate1 */
    code: "ParameterDamageRate";

    /** パラメータ Key. */
    parameterKey: string;

    /** 率 (double) */
    value: number;
}

export interface ITraitProps_SkillGuard {
    /** SkillGuard1 */
    code: "SkillGuard";

    /** スキル Key. */
    skillKey: string;
}

export interface ITraitProps_Unknown {
    code: "Unknown";
    dataKey: any;
    value: any;
}

export type ITraitProps =
    ITraitProps_DeathVulnerableElement |
    ITraitProps_RaceRate |
    ITraitProps_SurvivalParameterLossRate |
    ITraitProps_ParameterDamageRate |
    ITraitProps_SkillGuard |
    ITraitProps_Unknown;
