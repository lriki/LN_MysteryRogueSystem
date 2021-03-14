import { DStateTraitId } from "./DStateTrait";
import { REData } from "./REData";

export type DStateId = number;

export enum DStateRestriction {
    None = 0,

    /** 敵を攻撃 */
    AttcakToOpponent = 1,

    /** 誰かを攻撃 */
    AttackToOther = 2,

    /** 味方を攻撃 */
    AttcakToFriend = 3,

    /** 行動できない */
    NotAction = 4,
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

    // TODO: deprecated
    traits: DStateTraitId[];
    behaviors: string[];
}

export function DState_makeDefault(): DState {
    return {
        id: 0,
        displayName: "",
        key: "",
        restriction: 0,
        iconIndex: 0,
        message1: "",
        message2: "",
        message3: "",
        message4: "",
        traits: [],
        behaviors: [],
    }
}

export function makeStateTraitsFromMeta(meta: any): DStateTraitId[] {
    return REData.stateTraits
        .filter(trait => !!meta[trait.name])
        .map(trait => trait.id);
}

export function makeStateBehaviorsFromMeta(meta: any): string[] {
    const b = meta["RE-Behavior"];
    if (b) {
        if (b instanceof Array) {
            return b;
        }
        else {
            return [b];
        }
    }
    return [];
}
