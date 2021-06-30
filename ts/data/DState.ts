import { DTraitId } from "./DTraits";
import { REData } from "./REData";

export type DStateId = number;

export enum DAutoRemovalTiming {
    /** [RMMZ] なし */
    None = 0,

    /** [RMMZ] 行動終了時 */
    AfterAction = 1,

    /** [RMMZ] ターン終了時 */
    TurnEnd = 2,
}

export enum DStateRestriction {
    None = 0,

    /** [RMMZ] 敵を攻撃 */
    AttcakToOpponent = 1,

    /** [RMMZ] 誰かを攻撃 */
    AttackToOther = 2,

    /** [RMMZ] 味方を攻撃 */
    AttcakToFriend = 3,

    /** [RMMZ] 行動できない */
    NotAction = 4,
}

export class DState {
    /** ID (0 is Invalid). */
    id: DStateId;

    key: string;

    /** Name */
    displayName: string;

    /** Restriction */
    restriction: DStateRestriction;

    iconIndex: number;

    /** 自動解除のタイミング */
    autoRemovalTiming: DAutoRemovalTiming;

    /** 継続ターン数 Min */
    minTurns: number;

    /** 継続ターン数 Max */
    maxTurns: number;

    message1: string;
    message2: string;
    message3: string;
    message4: string;

    traits: IDataTrait[];

    // TODO: deprecated
    behaviors: string[];

    public constructor(id: DStateId) {
        this.id = id;
        this.displayName = "";
        this.key = "";
        this.restriction = 0;
        this.iconIndex = 0;
        this.autoRemovalTiming = DAutoRemovalTiming.None;
        this.minTurns = 0;
        this.maxTurns = 0;
        this.message1 = "";
        this.message2 = "";
        this.message3 = "";
        this.message4 = "";
        this.traits = [];
        this.behaviors = [];
    }
}

export function makeStateTraitsFromMeta(meta: any): IDataTrait[] {
    const raws = meta["RE-Trait"];
    if (!raws) return [];
    const list = (raws instanceof Array) ? raws : [raws];

    const traits: IDataTrait[] = [];
    for (const data of list) {
        const index = REData.traits.findIndex(x => x.name == data);
        if (index) {
            traits.push({ code: index, dataId: 0, value: 0 });
        }
        else {
            throw new Error(`Trait "${data}" is invalid.`);
        }
    }
    return traits;
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
