import { DStateTraitId } from "./DStateTrait";
import { REData } from "./REData";

export type DStateId = number;

export interface DState {
    /** ID (0 is Invalid). */
    id: DStateId;

    key: string;

    /** Name */
    displayName: string;

    /** Restriction */
    restriction: number;

    iconIndex: number;

    traits: DStateTraitId[];
}

export function makeStateTraitsFromMeta(meta: any): DStateTraitId[] {
    return REData.stateTraits
        .filter(trait => !!meta[trait.name])
        .map(trait => trait.id);
}
