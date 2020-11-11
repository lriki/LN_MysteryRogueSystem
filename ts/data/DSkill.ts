import { ParameterDataId } from "./REData";

export type SkillDataId = number;

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

export interface DUnitEffect {
    
    /**
     * 対象へダメージを与えるときにクリティカル判定を行うかかどうか。
     * 前方3方向など複数攻撃対象がいる場合は個別にクリティカルが発生することになる。
     * 攻撃の発生元での会心判定は Action として行うこと。
     * 
     * IDataSkill.damage.critical
     */
    critical: boolean;

    /**
     * IDataSkill.damage
     */
    parameterEffects: DParameterEffect[];
}


export interface DSkill {
    /** ID (0 is Invalid). */
    id: number;

    /** Name */
    name: string;

    /** Cost */
    paramCosts: ParameterDataId[];

    effect: DUnitEffect;
}

