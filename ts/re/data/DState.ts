import { DMatchConditions } from "./DCommon";
import { DEffect } from "./DEffect";
import { DParameterId } from "./DParameter";
import { DSequelId } from "./DSequel";
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

    ActualParam,
    DamageTesting,
    FloorTransfer,
}

export interface DAutoRemoval_None {
    kind: DAutoRemovalTiming.None;
}

export interface DAutoRemoval_AfterAction {
    kind: DAutoRemovalTiming.AfterAction;
}

export interface DAutoRemoval_TurnEnd {
    kind: DAutoRemovalTiming.TurnEnd;

    /** 継続ターン数 Min */
    minTurns: number;

    /** 継続ターン数 Max */
    maxTurns: number;
}

export interface DAutoRemoval_ActualParam {
    kind: DAutoRemovalTiming.ActualParam;
    formula: string;    // 条件が満たされたら削除する
}

export interface DAutoRemoval_DamageTesting {
    kind: DAutoRemovalTiming.DamageTesting;
    paramId: DParameterId,
}

export interface DAutoRemoval_FloorTransfer {
    kind: DAutoRemovalTiming.FloorTransfer;
}

export type DAutoRemoval =
    DAutoRemoval_None |
    DAutoRemoval_AfterAction |
    DAutoRemoval_TurnEnd |
    DAutoRemoval_ActualParam |
    DAutoRemoval_DamageTesting |
    DAutoRemoval_FloorTransfer;




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

export class DStateEffect {

    /** このステートが Match の子効果として定義される際の有効化条件 */
    matchConditions: DMatchConditions;

    /** Restriction */
    restriction: DStateRestriction;


    traits: IDataTrait[];

    behaviors: string[];


    /** 自動解除のタイミング */
    //autoRemovalTiming: DAutoRemovalTiming;
    autoRemovals: DAutoRemoval[];


    public constructor() {
        this.matchConditions = { kindId: 0 };
        this.restriction = 0;
        this.traits = [];
        this.behaviors = [];
        this.autoRemovals = [];
    }
}

export class DState {
    /** ID (0 is Invalid). */
    id: DStateId;

    key: string;

    /** Name */
    displayName: string;

    iconIndex: number;

    displayNameIcon: boolean;


    priority: number;

    message1: string;
    message2: string;
    message3: string;
    message4: string;

    stateGroupKeys: string[];
    stateGroupIds: DStateGroupId[];


    deadState: boolean;
    
    // ツクールの TRAIT では定数加算することができない。割合変化のみ。そのため用意したもの
    autoAdditionCondition: string | undefined;

    effect: DStateEffect;
    submatchStates: DStateId[];

    /** このステートが付加されているときの Idle Sequel。 */
    idleSequel: DSequelId;

    public constructor(id: DStateId) {
        this.id = id;
        this.displayName = "";
        this.key = "";
        this.iconIndex = 0;
        this.displayNameIcon = false;
        //this.autoRemovalTiming = DAutoRemovalTiming.None;
        //this.minTurns = 0;
        //this.maxTurns = 0;
        this.priority = 0;
        this.message1 = "";
        this.message2 = "";
        this.message3 = "";
        this.message4 = "";
        this.stateGroupKeys = [];
        this.stateGroupIds = [];
        this.deadState = false;//(id == 1);
        //this.minBuffLevel = -2;
        //this.maxBuffLevel = 2;
        //this.parameterBuffFormulas = [];
        this.autoAdditionCondition = undefined;
        this.effect = new DStateEffect();
        this.submatchStates = [];
        this.idleSequel = 0;
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

        switch (data.autoRemovalTiming) {
            case 0: // None
                break;
            case 1: // AfterAction
                this.effect.autoRemovals.push({ kind: DAutoRemovalTiming.AfterAction });
                break;
            case 2: // TurnEnd
                this.effect.autoRemovals.push({
                    kind: DAutoRemovalTiming.TurnEnd,
                    minTurns: data.minTurns,
                    maxTurns: data.maxTurns,
                });
                break;
            default:
                throw new Error("Unreachable.");
        }
    }
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

