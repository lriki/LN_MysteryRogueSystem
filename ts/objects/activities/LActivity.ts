import { assert } from "ts/Common";
import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { DSkill, DSkillDataId } from "ts/data/DSkill";
import { LEntity } from "../LEntity";
import { LEntityId } from "../LObject";
import { REGame } from "../REGame";

export interface LEntityIdData {
    index: number;
    key: number;
}

// LActivity を保存するためのデータ。
// UnitTest では JsonEx が使えなかったり、JsonEx 使うと型情報を含むため Save/Load の時間が気になったりするので用意したもの。
export interface LActivityData {
    actionId: DActionId;
    subject: LEntityIdData;
    object: LEntityIdData;
    objects2: LEntityIdData[];
    skillId: DSkillDataId,
    direction: number;
    consumeAction: boolean;
    fastForward: boolean;
}

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
    private _skillId: DSkillDataId;
    private _direction: number;     // 行動に伴う向き。0 の場合は未指定。
    private _consumeAction: boolean;
    private _fastForward: boolean;  // ダッシュ移動など、本来 Activity を伴う個々のアクションをまとめて行うフラグ

    public constructor() {
        this._actionId = 0;
        this._subject = LEntityId.makeEmpty();
        this._object = LEntityId.makeEmpty();
        this._objects2 = [];
        this._skillId = 0;
        this._direction = 0;
        this._consumeAction = false;
        this._fastForward = false;
    }

    public setup(actionId: DActionId, subject: LEntity, object?: LEntity, dir?: number): this {
        this._actionId = actionId;
        this._subject = subject.entityId();
        this._object = object ? object.entityId() : LEntityId.makeEmpty();
        this._objects2 = [];
        this._direction = dir ?? 0;
        this._consumeAction = false;
        this._fastForward = false;
        return this;
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

    public skillId(): DSkillDataId {
        return this._skillId;
    }

    public withDirection(d: number): this {
        this._direction = d;
        return this;
    }

    public direction(): number {
        return this._direction;
    }

    public hasDirection(): boolean {
        return this._direction != 0;
    }

    public withConsumeAction(): this {
        this._consumeAction = true;
        return this;
    }

    public isConsumeAction(): boolean {
        return this._consumeAction;
    }

    public withFastForward(): this {
        this._fastForward = true;
        return this;
    }

    public isFastForward(): boolean {
        return this._fastForward;
    }

    public toData(): LActivityData {
        return {
            actionId: this._actionId,
            subject: { index: this._subject.index2(), key: this._subject.key2() },
            object: { index: this._object.index2(), key: this._object.key2() },
            objects2: this._objects2.map(x => { return { index: x.index2(), key: x.key2() }; }),
            skillId: this._skillId,
            direction: this._direction,
            consumeAction: this._consumeAction,
            fastForward: this._fastForward,
        }
    }

    public static makeFromData(data: LActivityData): LActivity {
        const i = new LActivity();
        i._actionId = data.actionId;
        i._subject = new LEntityId(data.subject.index, data.subject.key);
        i._object = new LEntityId(data.object.index, data.object.key);
        i._objects2 = data.objects2.map(x => new LEntityId(x.index, x.key));
        i._skillId = data.skillId;
        i._direction = data.direction;
        i._consumeAction = data.consumeAction;
        i._fastForward = data.fastForward;
        return i;
    }

    //--------------------
    // Utils

    public static make(subject: LEntity): LActivity {
        return (new LActivity()).setup(0, subject);
    }

    public static makeDirectionChange(subject: LEntity, dir: number): LActivity {
        return (new LActivity()).setup(DBasics.actions.DirectionChangeActionId, subject, undefined, dir);
    }

    public static makeMoveToAdjacent(subject: LEntity, dir: number): LActivity {
        return (new LActivity()).setup(DBasics.actions.MoveToAdjacentActionId, subject, undefined, dir);
    }

    public static makePick(subject: LEntity): LActivity {
        return (new LActivity()).setup(DBasics.actions.PickActionId, subject);
    }

    public static makePut(subject: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(DBasics.actions.PutActionId, subject, object);
    }

    public static makeThrow(subject: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(DBasics.actions.ThrowActionId, subject, object);
    }

    public static makeExchange(subject: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(DBasics.actions.ExchangeActionId, subject, object);
    }

    public static makeEquip(subject: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(DBasics.actions.EquipActionId, subject, object);
    }

    public static makeEquipOff(subject: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(DBasics.actions.EquipOffActionId, subject, object);
    }

    
    public static makeEat(subject: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(DBasics.actions.EatActionId, subject, object);
    }

    public static makeWave(subject: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(DBasics.actions.WaveActionId, subject, object);
    }

    public static makeRead(subject: LEntity, object: LEntity, targets?: LEntity[]): LActivity {
        const a = (new LActivity()).setup(DBasics.actions.ReadActionId, subject, object);
        if (targets) a.setObjects2(targets);
        return a;
    }

    public static makePutIn(subject: LEntity, storage: LEntity, item: LEntity): LActivity {
        const a = (new LActivity()).setup(DBasics.actions.PutInActionId, subject, storage);
        a._objects2 = [item.entityId()];
        return a;
    }

    public static makePerformSkill(subject: LEntity, skillId: DSkillDataId, dirToFace?: number): LActivity {
        assert(skillId > 0);
        const a = (new LActivity()).setup(DBasics.actions.performSkill, subject);
        if (dirToFace !== undefined) a._direction = dirToFace;
        a._skillId = skillId;
        return a;
    }
}

