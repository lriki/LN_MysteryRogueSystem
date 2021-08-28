import { DStateGroupId } from "./DStateGroup";
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

    
    /** 暗闇 */
    Blind = 5,
}
export namespace DStateRestriction {
    export function fromRmmzRestriction(value: number) {
        switch(value) {
            case 0:
                return DStateRestriction.None;
            case 1:
                return DStateRestriction.AttcakToOpponent;
            case 2:
                return DStateRestriction.AttackToOther;
            case 3:
                return DStateRestriction.AttcakToFriend;
            case 4:
                return DStateRestriction.NotAction;
            default:
                throw new Error("Unreachable.");
        }
    }
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

    displayNameIcon: boolean;

    /** 自動解除のタイミング */
    autoRemovalTiming: DAutoRemovalTiming;

    /** 継続ターン数 Min */
    minTurns: number;

    /** 継続ターン数 Max */
    maxTurns: number;

    priority: number;

    message1: string;
    message2: string;
    message3: string;
    message4: string;

    traits: IDataTrait[];

    // TODO: deprecated
    behaviors: string[];

    stateGroupKeys: string[];
    stateGroupIds: DStateGroupId[];



    //minBuffLevel: number;
    //maxBuffLevel: number;
    //parameterBuffFormulas: (string | undefined)[];    // Index is DParameterId.
    // ツクールの TRAIT では定数加算することができない。割合変化のみ。そのため用意したもの

    autoAdditionCondition: string | undefined;

    public constructor(id: DStateId) {
        this.id = id;
        this.displayName = "";
        this.key = "";
        this.restriction = 0;
        this.iconIndex = 0;
        this.displayNameIcon = false;
        this.autoRemovalTiming = DAutoRemovalTiming.None;
        this.minTurns = 0;
        this.maxTurns = 0;
        this.priority = 0;
        this.message1 = "";
        this.message2 = "";
        this.message3 = "";
        this.message4 = "";
        this.traits = [];
        this.behaviors = [];
        this.stateGroupKeys = [];
        this.stateGroupIds = [];
        //this.minBuffLevel = -2;
        //this.maxBuffLevel = 2;
        //this.parameterBuffFormulas = [];
    }

    public import(data: IDataState): void {
        if (data.meta) {
            {
                const raws = data.meta["RE-StateGroup"];
                if (raws) {
                    this.stateGroupKeys = (raws instanceof Array) ? raws : [raws];
                }
            }
        }
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
