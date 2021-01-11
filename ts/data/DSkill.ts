import { ParameterDataId } from "./REData";

export type DSkillDataId = number;

export enum DParameterEffectApplyType {
    Damage,
    Recover,
    Drain,
}

export interface DParameterEffect {
    parameterId: ParameterDataId;

    elementId: number;  // (Index of DSystem.elements)

    formula: string;

    /** IDataSkill.damage.type  */
    applyType: DParameterEffectApplyType;

    /** 分散度 */
    variance: number;
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


export enum DEffectType {
    /** なし */
    None = 0,

    /** HP ダメージ */
    HpDamage = 1,

    /** MP ダメージ */
    MpDamage = 2,

    /** HP 回復 */
    HpRecover = 3,

    /** MP 回復 */
    MpRecover = 4,

    /** HP 吸収 */
    HpDrain = 5,

    /** MP 吸収 */
    MpDrain = 6
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

    //elementId: number;
    //formula: string;
    type: number;
    //variance: number;

    /**
     * IDataSkill.damage
     */
    parameterEffects: DParameterEffect[];
}

export const DEffect_Default: DEffect = {
    critical: false,
    parameterEffects: [],
};


export interface DSkill {
    /** ID (0 is Invalid). */
    id: DSkillDataId;

    /** Name */
    name: string;

    /** Cost */
    paramCosts: ParameterDataId[];

    scope: DEffectScope;

    effect: DEffect;
}

export const DSkill_Default: DSkill = {
    id: 0,
    name: "null",
    paramCosts: [],
    scope: DEffectScope.None,
    effect: DEffect_Default,
};
