
export type DAbilityId = number;

export interface DAbility {
    id: DAbilityId;
    key: string;
    reactions: { [key: string]: string };
}

export function DAbility_Default(): DAbility {
    return {
        id: 0,
        key: "null",
        reactions: {},
    };
}
