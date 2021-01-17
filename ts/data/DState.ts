import { DStateTraitId } from "./DStateTrait";
import { REData } from "./REData";

export type DStateId = number;

export enum DStateRestriction {

}

export interface DState {
    /** ID (0 is Invalid). */
    id: DStateId;

    key: string;

    /** Name */
    displayName: string;

    /** Restriction */
    restriction: number;

    iconIndex: number;

    message1: string;
    message2: string;
    message3: string;
    message4: string;

    traits: DStateTraitId[];
}

export function makeStateTraitsFromMeta(meta: any): DStateTraitId[] {
    return REData.stateTraits
        .filter(trait => !!meta[trait.name])
        .map(trait => trait.id);
}
