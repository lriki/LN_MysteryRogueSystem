
export type DAbilityId = number;

export interface DReaction {
    command: string;
    script: string;
}

export interface DAbility {
    id: DAbilityId;
    key: string;
    reactions: DReaction[];
}

export function DAbility_Default(): DAbility {
    return {
        id: 0,
        key: "null",
        reactions: [],
    };
}
