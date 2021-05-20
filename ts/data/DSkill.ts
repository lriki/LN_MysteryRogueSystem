import { DEffect, DEffectScope, DEffect_Default } from "./DEffect";
import { DParameterId } from "./DParameter";

export type DSkillDataId = number;


export interface DSkill {
    /** ID (0 is Invalid). */
    id: DSkillDataId;

    /** Name */
    name: string;

    rmmzAnimationId: number;

    /** Cost */
    paramCosts: DParameterId[];

    scope: DEffectScope;

    effect: DEffect;
}

export function DSkill_Default(): DSkill {
    return {
        id: 0,
        name: "null",
        rmmzAnimationId: 0,
        paramCosts: [],
        scope: DEffectScope.None,
        effect: DEffect_Default(),
    };
}
