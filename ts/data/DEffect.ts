import { DParameterId } from "./DParameter";



export enum DParameterEffectApplyType {
    /** なし */
    None,

    /** ダメージ */
    Damage,

    /** 回復 */
    Recover,

    /** 吸収 */
    Drain,
}

export interface DParameterQualifying {
    parameterId: DParameterId;

    elementId: number;  // (Index of DSystem.elements)

    formula: string;

    /** IDataSkill.damage.type  */
    applyType: DParameterEffectApplyType;

    /** 分散度 */
    variance: number;
}

export interface DPerformeSkillQualifying {
}

export interface DOtherEffectQualifying {
}

export enum DEffectScope {
    /** なし */
    None = 0,

    /** 敵,単体 */
    Opponent_Single = 1,

    /** 敵,全体 */
    Opponent_All = 2,

    /** 敵,ランダム,1 */
    Opponent_Random_1 = 3,

    /** 敵,ランダム,2 */
    Opponent_Random_2 = 4,

    /** 敵,ランダム,3 */
    Opponent_Random_3 = 5,

    /** 敵,ランダム,4 */
    Opponent_Random_4 = 6,

    /** 味方,単体,生存 */
    Friend_Single_Alive = 7,

    /** 味方,全体,生存 */
    Friend_All_Alive = 8,

    /** 味方,単体,戦闘不能 */
    Friend_Single_Dead = 9,

    /** 味方,全体,戦闘不能 */
    Friend_All_Dead = 10,

    /** 使用者 */
    User = 11,

    /** 味方,単体,無条件 */
    Friend_Single_Unconditional = 12,

    /** 味方,全体,無条件 */
    Friend_All_Unconditional = 13,

    /** 敵と味方,全体 */
    Everyone = 14,
}

export enum DEffectHitType {
    Certain = 0,
    Physical = 1,
    Magical = 2,
}


/**
 * RMMZ の Skill と Item の共通パラメータ
 */
export interface DEffect {
    
    /**
     * 対象へダメージを与えるときにクリティカル判定を行うかかどうか。
     * 前方3方向など複数攻撃対象がいる場合は個別にクリティカルが発生することになる。
     * 攻撃の発生元での会心判定は Action として行うこと。
     * 
     * IDataSkill.damage.critical
     */
    critical: boolean;

    /**
     * IDataSkill.successRate
     * IDataItem.successRate
     * 整数値。0~100
     */
    successRate: number;

    hitType: DEffectHitType;

    /**
     * IDataSkill.damage
     * IDataItem.damage
     */
    parameterQualifyings: DParameterQualifying[];
    performeSkillQualifyings: DPerformeSkillQualifying[];
    otherEffectQualifyings: DOtherEffectQualifying[];

    /**
     * IDataSkill.effects
     * IDataItem.effects
     */
    specialEffects: IDataEffect[];
}

export function DEffect_Default(): DEffect {
    return {
        critical: false,
        successRate: 100,
        hitType: DEffectHitType.Certain,
        parameterQualifyings: [],
        performeSkillQualifyings: [],
        otherEffectQualifyings: [],
        specialEffects: [],
    };
};

export function DEffect_Clone(s: DEffect): DEffect {
    return {
        critical: s.critical,
        successRate: s.successRate,
        hitType: s.hitType,
        parameterQualifyings: s.parameterQualifyings.slice(),
        performeSkillQualifyings: s.performeSkillQualifyings.slice(),
        otherEffectQualifyings: s.otherEffectQualifyings.slice(),
        specialEffects: s.specialEffects.slice(),
    };
}

/** Effect の発生要因。実際にどれを選択するかは Behavior に依る。 */
export enum DEffectCause {
    /** 効果範囲内の対象へのスキル効果適用。通常攻撃、魔法など。 */
    Affect,

    /** 食べる。飲む。命中判定は行わず必中。 */
    Eat,

    /** 飛翔体として衝突。草効果の壺などはこれ。 */
    Hit,
}

export class DEffectSet {
    private _effects: (DEffect | undefined)[] = [];

    public setEffect(cause: DEffectCause, data: DEffect): void {
        this._effects[cause] = data;
    }

    public effect(cause: DEffectCause): DEffect | undefined {
        return this._effects[cause];
    }

    public aquireEffect(cause: DEffectCause): DEffect {
        let effect = this._effects[cause];
        if (effect) {
            return effect;
        }
        else {
            effect = DEffect_Default();
            this._effects[cause] = effect;
            return effect;
        }
    }

    //public addParamQualifying(data: DParameterQualifying): void {
//
    //}


}

