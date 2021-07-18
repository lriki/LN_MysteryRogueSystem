import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { LEntity } from "../LEntity";
import { LEntityId } from "../LObject";
import { REGame } from "../REGame";

/**
 * 主に GUI 上から選択できる各種行動
 * 
 * Command のように利用できるが、Activity は必ず Dialog から post される。
 * 大方針として、プレイヤー操作などコマンドチェーンの外側から実行される Command を表すものであり、
 * 行動履歴として記録される。シリアライズされ、ファイルに保存される。
 * 
 * [向き変更] や 壺操作 [いれる] [だす] など Activity によっては追加の引数が必要となることがあるが、
 * それらは派生クラスで実装する。
 */
export class LActivity {
    private _actionId: DActionId;
    private _subject: LEntityId;    // Command 送信対象 (主語)
    private _object: LEntityId;     // (目的語)
    private _objects2: LEntityId[];
    private _direction: number;     // 行動に伴う向き。0 の場合は未指定。

    public constructor(actionId: DActionId, subject: LEntity, object?: LEntity, dir?: number) {
        this._actionId = actionId;
        this._subject = subject.entityId();
        this._object = object ? object.entityId() : LEntityId.makeEmpty();
        this._objects2 = [];
        this._direction = dir ?? 0;
    }

    public actionId(): DActionId {
        return this._actionId;
    }

    public subject(): LEntity {
        return REGame.world.entity(this._subject);
    }

    public hasObject(): boolean {
        return this._object.hasAny();
    }

    public object(): LEntity {
        return REGame.world.entity(this._object);
    }

    public objects2(): LEntity[] {
        return this._objects2.map(x => REGame.world.entity(x));
    }

    public setObjects2(objects: LEntity[]): void {
        this._objects2 = objects.map(x => x.entityId());
    }

    public direction(): number {
        return this._direction;
    }

    public hasDirection(): boolean {
        return this._direction != 0;
    }

    //--------------------
    // Utils

    public static makeDirectionChange(subject: LEntity, dir: number): LActivity {
        return new LActivity(DBasics.actions.DirectionChangeActionId, subject, undefined, dir);
    }

    public static makeMoveToAdjacent(subject: LEntity, dir: number): LActivity {
        return new LActivity(DBasics.actions.MoveToAdjacentActionId, subject, undefined, dir);
    }

    public static makePick(subject: LEntity): LActivity {
        return new LActivity(DBasics.actions.PickActionId, subject);
    }

    public static makePut(subject: LEntity, object: LEntity): LActivity {
        return new LActivity(DBasics.actions.PutActionId, subject, object);
    }

    public static makeThrow(subject: LEntity, object: LEntity): LActivity {
        return new LActivity(DBasics.actions.ThrowActionId, subject, object);
    }

    public static makeExchange(subject: LEntity, object: LEntity): LActivity {
        return new LActivity(DBasics.actions.ExchangeActionId, subject, object);
    }

    public static makeEquip(subject: LEntity, object: LEntity): LActivity {
        return new LActivity(DBasics.actions.EquipActionId, subject, object);
    }

    public static makeEquipOff(subject: LEntity, object: LEntity): LActivity {
        return new LActivity(DBasics.actions.EquipOffActionId, subject, object);
    }

    
    public static makeEat(subject: LEntity, object: LEntity): LActivity {
        return new LActivity(DBasics.actions.EatActionId, subject, object);
    }

    public static makeWave(subject: LEntity, object: LEntity): LActivity {
        return new LActivity(DBasics.actions.WaveActionId, subject, object);
    }

    public static makeRead(subject: LEntity, object: LEntity): LActivity {
        return new LActivity(DBasics.actions.ReadActionId, subject, object);
    }

    public static makePutIn(subject: LEntity, storage: LEntity, item: LEntity): LActivity {
        const a = new LActivity(DBasics.actions.PutInActionId, subject, storage);
        a._objects2 = [item.entityId()];
        return a;
    }
}

