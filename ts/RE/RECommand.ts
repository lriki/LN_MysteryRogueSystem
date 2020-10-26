import { REData, REData_Action } from "./REData";
import { REGame_Entity } from "./REGame_Entity";

/** RECommand の処理結果 */
export enum REResponse
{
    /** 目的の処理を実行し終え、 RECommand は実行済みであることを示します。後続の Behavior に RECommand は通知されません。 */
    Consumed,

    /** RECommand はハンドリングされませんでした。続けて後続の Behavior に RECommand を通知します。 */
    Pass,

    //Aborted,
}

/** Command 表現及び引数 */
export class RECommand
{
    private _action: REData_Action = REData.actions[0];
    private _actor: REGame_Entity | undefined;
    private _reactor: REGame_Entity | undefined;

    setup(action: REData_Action, actor: REGame_Entity, reactor: REGame_Entity) {
        this._action = action;
        this._actor = actor;
        this._reactor = reactor;
    }

    /** この Command の発生元となった Action */
    action(): REData_Action { return this._action; }

    /** Action 側 Entity */
    actor(): REGame_Entity | undefined { return this._actor; }

    /** Reaction 側 Entity */
    reactor(): REGame_Entity | undefined { return this._reactor; }
}

