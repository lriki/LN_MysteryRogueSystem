import { REData, REData_Action } from "../data/REData";
import { REGame_Entity } from "../RE/REGame_Entity";

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
export class RECommand
{
    private _action: REData_Action = REData.actions[0];
    private _actor: REGame_Entity | undefined;
    private _reactor: REGame_Entity | undefined;

    setup(action: REData_Action, actor: REGame_Entity, reactor: REGame_Entity | undefined) {
        this._action = action;
        this._actor = actor;
        this._reactor = reactor;
    }

    /** この Command の発生元となった Action */
    action(): REData_Action { return this._action; }

    /** Action 側 Entity */
    actor(): REGame_Entity {
        if (this._actor)
            return this._actor;
        else
            throw new Error();
    }

    /** Reaction 側 Entity */
    reactor(): REGame_Entity | undefined { return this._reactor; }
}


