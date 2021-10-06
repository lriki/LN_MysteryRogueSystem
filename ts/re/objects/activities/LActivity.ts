import { assert, RESerializable } from "ts/re/Common";
import { DActionId } from "ts/re/data/DAction";
import { REBasics } from "ts/re/data/REBasics";
import { DSkillId } from "ts/re/data/DCommon";
import { SAIHelper } from "ts/re/system/SAIHelper";
import { UMovement } from "ts/re/usecases/UMovement";
import { LActionTokenType } from "../LActionToken";
import { LBlock } from "../LBlock";
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
    actor: LEntityIdData;
    object: LEntityIdData;
    objects2: LEntityIdData[];
    skillId: DSkillId,
    direction: number;
    entityDirection: number;
    consumeActionType: LActionTokenType | undefined;
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
@RESerializable
export class LActivity {
    private _actionId: DActionId;
    private _actor: LEntityId;      // Command 送信対象
    private _subject: LEntityId;    // Activity の主題。経験値等はここに流れる。
    private _object: LEntityId;     // (目的語)
    private _objects2: LEntityId[];
    private _skillId: DSkillId;
    private _effectDirection: number;     // 行動に伴う向き。0 の場合は未指定。
    private _entityDirection: number;   // 行動前に Entity を向かせたい向き。0 の場合は向きを変更しない。
    private _consumeActionType: (LActionTokenType | undefined);
    private _fastForward: boolean;  // ダッシュ移動など、本来 Activity を伴う個々のアクションをまとめて行うフラグ

    public constructor() {
        this._actionId = 0;
        this._actor = LEntityId.makeEmpty();
        this._subject = LEntityId.makeEmpty();
        this._object = LEntityId.makeEmpty();
        this._objects2 = [];
        this._skillId = 0;
        this._effectDirection = 0;
        this._entityDirection = 0;
        this._consumeActionType = undefined;
        this._fastForward = false;
    }

    public setup(actionId: DActionId, actor: LEntity, object?: LEntity, dir?: number): this {
        this._actionId = actionId;
        this._actor = actor.entityId().clone();
        this._subject = actor.entityId().clone();
        this._object = object ? object.entityId() : LEntityId.makeEmpty();
        this._objects2 = [];
        this._effectDirection = dir ?? 0;
        this._entityDirection = 0;
        this._consumeActionType = undefined;
        this._fastForward = false;
        return this;
    }

    public actionId(): DActionId {
        return this._actionId;
    }

    public actor(): LEntity {
        return REGame.world.entity(this._actor);
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

    public skillId(): DSkillId {
        return this._skillId;
    }

    public withOtherSubject(subject: LEntity): this {
        this._subject = subject.entityId().clone();
        return this;
    }

    public withEffectDirection(d: number): this {
        this._effectDirection = d;
        return this;
    }

    public effectDirection(): number {
        return this._effectDirection;
    }

    public hasEffectDirection(): boolean {
        return this._effectDirection != 0;
    }
    
    public entityDirection(): number {
        return this._entityDirection;
    }

    public withEntityDirection(dir: number): this {
        this._entityDirection = dir;
        return this;
    }

    public withConsumeAction(tokenType?: LActionTokenType | undefined): this {
        if (tokenType) {
            this._consumeActionType = tokenType;
        }
        else {
            if (this._actionId == REBasics.actions.MoveToAdjacentActionId) {
                this._consumeActionType = LActionTokenType.Minor;
            }
            else {
                this._consumeActionType = LActionTokenType.Major;
                //throw new Error("Not implemented.");
            }
        }
        return this;
    }

    public isConsumeAction(): boolean {
        return this._consumeActionType != undefined;
    }

    public consumeActionTokenType(): LActionTokenType | undefined {
        return this._consumeActionType;
    }

    public getConsumeActionTokenType(): LActionTokenType {
        assert(this._consumeActionType !== undefined);
        return this._consumeActionType;
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
            actor: { index: this._actor.index2(), key: this._actor.key2() },
            object: { index: this._object.index2(), key: this._object.key2() },
            objects2: this._objects2.map(x => { return { index: x.index2(), key: x.key2() }; }),
            skillId: this._skillId,
            direction: this._effectDirection,
            entityDirection: this._entityDirection,
            consumeActionType: this._consumeActionType,
            fastForward: this._fastForward,
        }
    }

    public static makeFromData(data: LActivityData): LActivity {
        const i = new LActivity();
        i._actionId = data.actionId;
        i._actor = new LEntityId(data.actor.index, data.actor.key);
        i._object = new LEntityId(data.object.index, data.object.key);
        i._objects2 = data.objects2.map(x => new LEntityId(x.index, x.key));
        i._skillId = data.skillId;
        i._effectDirection = data.direction;
        i._entityDirection = data.entityDirection;
        i._consumeActionType = data.consumeActionType;
        i._fastForward = data.fastForward;
        return i;
    }

    //--------------------
    // Utils

    public static make(actor: LEntity): LActivity {
        return (new LActivity()).setup(0, actor);
    }

    public static makeDirectionChange(actor: LEntity, dir: number): LActivity {
        return (new LActivity()).setup(REBasics.actions.DirectionChangeActionId, actor, undefined, dir).withEntityDirection(dir);
    }

    public static makeMoveToAdjacent(actor: LEntity, dir: number): LActivity {
        return (new LActivity()).setup(REBasics.actions.MoveToAdjacentActionId, actor, undefined, dir);
    }

    public static makeMoveToAdjacentBlock(actor: LEntity, block: LBlock): LActivity {
        //assert(UMovement.blockDistance(actor.x, actor.y, block.x(), block.y()) <= 1);    // 隣接ブロックであること
        assert(UMovement.checkAdjacent(actor.x, actor.y, block.x(), block.y()));    // 隣接ブロックであること
        const dir = SAIHelper.distanceToDir(actor.x, actor.y, block.x(), block.y());
        return (new LActivity()).setup(REBasics.actions.MoveToAdjacentActionId, actor, undefined, dir);
    }

    public static makePick(actor: LEntity): LActivity {
        return (new LActivity()).setup(REBasics.actions.PickActionId, actor);
    }

    public static makePut(actor: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(REBasics.actions.PutActionId, actor, object);
    }

    public static makeThrow(actor: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(REBasics.actions.ThrowActionId, actor, object);
    }

    public static makeExchange(actor: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(REBasics.actions.ExchangeActionId, actor, object);
    }

    public static makeEquip(actor: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(REBasics.actions.EquipActionId, actor, object);
    }

    public static makeEquipOff(actor: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(REBasics.actions.EquipOffActionId, actor, object);
    }
    
    public static makeEat(actor: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(REBasics.actions.EatActionId, actor, object);
    }

    public static makeWave(actor: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(REBasics.actions.WaveActionId, actor, object);
    }

    public static makeRead(actor: LEntity, object: LEntity, targets?: LEntity[]): LActivity {
        const a = (new LActivity()).setup(REBasics.actions.ReadActionId, actor, object);
        if (targets) a.setObjects2(targets);
        return a;
    }

    public static makePutIn(actor: LEntity, storage: LEntity, item: LEntity): LActivity {
        const a = (new LActivity()).setup(REBasics.actions.PutInActionId, actor, storage);
        a._objects2 = [item.entityId()];
        return a;
    }

    public static makeTalk(actor: LEntity): LActivity {
        const a = (new LActivity()).setup(REBasics.actions.talk, actor);
        return a;
    }

    public static makePerformSkill(actor: LEntity, skillId: DSkillId, dirToFace?: number): LActivity {
        assert(skillId > 0);
        const a = (new LActivity()).setup(REBasics.actions.performSkill, actor);
        if (dirToFace !== undefined) a._effectDirection = dirToFace;
        a._skillId = skillId;
        return a;
    }
}

