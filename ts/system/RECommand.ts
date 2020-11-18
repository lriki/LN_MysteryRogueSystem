import { REData, REData_Action } from "../data/REData";
import { REGame_Entity } from "../RE/REGame_Entity";
import { REEffectContext } from "./REEffectContext";

/** RECommand の処理結果 */
export enum REResponse
{
    /** 目的の処理を実行し終え、 RECommand は実行済みであることを示します。後続の Behavior に RECommand は通知されません。 */
    Consumed,

    /** RECommand はハンドリングされませんでした。続けて後続の Behavior に RECommand を通知します。 */
    Pass,

    /** 状態異常の制限により、目的の処理を実行できなかったことを示します。後続の Behavior に RECommand は通知されません。 */
    Canceled,

    //Aborted,
}

/** Command 表現及び引数 */
export class RECommand  // sealed
{
    private _actionId: number;
    private _actor: REGame_Entity;
    private _reactor: REGame_Entity | undefined;
    private _effectContext: REEffectContext | undefined;
    private _args: any;

    constructor(actionId: number, actor: REGame_Entity, reactor: REGame_Entity | undefined, effectContext: REEffectContext | undefined, args: any) {
        this._actionId = actionId;
        this._actor = actor;
        this._reactor = reactor;
        this._effectContext = effectContext;
        this._args = args;
    }

    /** この Command の発生元となった Action */
    action(): REData_Action { return REData.actions[this._actionId]; }

    args(): any { return this._args; }

    /** Action 側 Entity */
    actor(): REGame_Entity {
        if (this._actor)
            return this._actor;
        else
            throw new Error();
    }

    /** Reaction 側 Entity */
    reactor(): REGame_Entity | undefined { return this._reactor; }

    effectContext(): REEffectContext | undefined { return this._effectContext; }

    save(): string {
        return JSON.stringify({ act: this._actionId, args: this.args });
    }
}


