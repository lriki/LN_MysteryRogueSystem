import { ParameterDataId } from "./REData";

export type SkillDataId = number;

export interface DSkill {
    /** ID (0 is Invalid). */
    id: number;

    /** Name */
    name: string;

    /** Cost */
    paramCosts: ParameterDataId[];

    
    damage: {
        /**
         * 対象へダメージを与えるときにクリティカル判定を行うかかどうか。
         * 前方3方向など複数攻撃対象がいる場合は個別にクリティカルが発生することになる。
         * 攻撃の発生元での会心判定は Action として行うこと。
         */
        critical: boolean;

        elementId: number;  // (Index of DSystem.elements)

        formula?: string;
        type?: number;
        variance?: number;
    }
}

