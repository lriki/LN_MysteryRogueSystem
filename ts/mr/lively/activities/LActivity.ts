import { assert, MRSerializable } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import { DActionId, DSkillId } from "ts/mr/data/DCommon";
import { SAIHelper } from "ts/mr/system/SAIHelper";
import { UMovement } from "ts/mr/utility/UMovement";
import { LBlock } from "../LBlock";
import { LEntity } from "../entity/LEntity";
import { LEntityId } from "../LObject";
import { MRLively } from "../MRLively";
import { MRData } from "ts/mr/data/MRData";
import { LActionTokenConsumeType } from "../LCommon";
import { DSkill } from "ts/mr/data/DSkill";

export interface LEntityIdData {
    index: number;
    key: number;
}

export enum LDashType {
    /** 直線ダッシュ。アイテムの前で止まる。 */
    StraightDash,

    /** iダッシュ。 */
    PositionalDash,
}

export interface LDashInfo {
    type: LDashType;
    targetX?: number | undefined;
    targetY?: number | undefined;
}


// LActivity を保存するためのデータ。
// UnitTest では JsonEx が使えなかったり、JsonEx 使うと型情報を含むため Save/Load の時間が気になったりするので用意したもの。
export interface LActivityData {
    actionId: DActionId;
    actor: LEntityIdData;
    subject: LEntityIdData;
    object: LEntityIdData;
    objects2: LEntityIdData[];
    skillId: DSkillId,
    direction: number;
    entityDirection: number;
    actionTokenConsumeType: LActionTokenConsumeType | undefined;
    args: LDashInfo | undefined;
    selectedAction: string;
}

/**
 * Unit の "行動"。
 * 
 * 行動履歴として記録される。シリアライズされ、ファイルに保存される。
 * 
 * 
 * 
 * Activity にするべきか迷ったとき
 * ----------
 * ### 未知の拡張機能により、行動がリジェクトされることを想定するか？
 */
@MRSerializable
export class LActivity {
    private _actionId: DActionId;
    private _actor: LEntityId;      // Command 送信対象。明示されない場合は subject と等しい。
    private _subject: LEntityId;    // Activity の主題。経験値等はここに流れる。例えば飛び道具の衝突 Activity の場合、飛んでいる矢は actor, 撃った人は subject。
    private _object: LEntityId;     // (目的語)
    private _objects2: LEntityId[];
    private _skillId: DSkillId;
    private _effectDirection: number;     // 行動に伴う向き。0 の場合は未指定。
    private _entityDirection: number;   // 行動前に Entity を向かせたい向き。0 の場合は向きを変更しない。
    private _actionTokenConsumeType: (LActionTokenConsumeType | undefined);
    private _args: LDashInfo | undefined;
    private _selectedAction: string;    // yes, no などの DialogResult
    //private _selectedItems: LEntityId[];

    public constructor() {
        this._actionId = 0;
        this._actor = LEntityId.makeEmpty();
        this._subject = LEntityId.makeEmpty();
        this._object = LEntityId.makeEmpty();
        this._objects2 = [];
        this._skillId = 0;
        this._effectDirection = 0;
        this._entityDirection = 0;
        this._actionTokenConsumeType = undefined;
        this._args = undefined;
        this._selectedAction = "";
    }

    public setup(actionId: DActionId, actor: LEntity, object?: LEntity, dir?: number): this {
        this._actionId = actionId;
        this._actor = actor.entityId().clone();
        this._subject = actor.entityId().clone();
        this._object = object ? object.entityId() : LEntityId.makeEmpty();
        this._objects2 = [];
        this._effectDirection = dir ?? 0;
        this._entityDirection = 0;
        this._actionTokenConsumeType = undefined;
        this._args = undefined;
        this._selectedAction = "";
        return this;
    }

    public actionId(): DActionId {
        return this._actionId;
    }

    public get action(): DSkill {
        return MRData.skills[this._actionId];
    }

    public actor(): LEntity {
        return MRLively.world.entity(this._actor);
    }

    public subject(): LEntity {
        return MRLively.world.entity(this._subject);
    }

    public hasObject(): boolean {
        return this._object.hasAny();
    }

    public object(): LEntity {
        return MRLively.world.entity(this._object);
    }

    public setObject(object: LEntity): void {
        this._object = object.entityId();
    }

    public objects2(): LEntity[] {
        return this._objects2.map(x => MRLively.world.entity(x));
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

    public withConsumeAction(consumeType?: LActionTokenConsumeType | undefined): this {
        if (consumeType !== undefined) {
            this._actionTokenConsumeType = consumeType;
        }
        else {
            if (this._actionId == MRBasics.actions.MoveToAdjacentActionId) {
                this._actionTokenConsumeType = LActionTokenConsumeType.MinorActed;
            }
            else {
                this._actionTokenConsumeType = LActionTokenConsumeType.MajorActed;
            }
        }
        return this;
    }

    public isConsumeAction(): boolean {
        return this._actionTokenConsumeType != undefined;
    }

    public consumeActionTokenType(): LActionTokenConsumeType | undefined {
        return this._actionTokenConsumeType;
    }

    public getConsumeActionTokenType(): LActionTokenConsumeType {
        assert(this._actionTokenConsumeType !== undefined);
        return this._actionTokenConsumeType;
    }

    public withArgs(args: LDashInfo | undefined): this {
        this._args = args;
        return this;
    }

    public args(): LDashInfo | undefined {
        return this._args;
    }

    public selectedAction(): string {
        return this._selectedAction;
    }

    public toData(): LActivityData {
        return {
            actionId: this._actionId,
            actor: { index: this._actor.index2(), key: this._actor.key2() },
            subject: { index: this._subject.index2(), key: this._subject.key2() },
            object: { index: this._object.index2(), key: this._object.key2() },
            objects2: this._objects2.map(x => { return { index: x.index2(), key: x.key2() }; }),
            skillId: this._skillId,
            direction: this._effectDirection,
            entityDirection: this._entityDirection,
            actionTokenConsumeType: this._actionTokenConsumeType,
            args: this._args,
            selectedAction: this._selectedAction,
        }
    }

    public static makeFromData(data: LActivityData): LActivity {
        const i = new LActivity();
        i._actionId = data.actionId;
        i._actor = new LEntityId(data.actor.index, data.actor.key);
        i._subject = new LEntityId(data.subject.index, data.subject.key);
        i._object = new LEntityId(data.object.index, data.object.key);
        i._objects2 = data.objects2.map(x => new LEntityId(x.index, x.key));
        i._skillId = data.skillId;
        i._effectDirection = data.direction;
        i._entityDirection = data.entityDirection;
        i._actionTokenConsumeType = data.actionTokenConsumeType;
        i._args = data.args;
        i._selectedAction = data.selectedAction;
        return i;
    }

    //--------------------
    // Utils

    public static make(actor: LEntity): LActivity {
        return (new LActivity()).setup(0, actor);
    }

    public static makeDirectionChange(actor: LEntity, dir: number): LActivity {
        return (new LActivity()).setup(MRBasics.actions.DirectionChangeActionId, actor, undefined, dir).withEntityDirection(dir);
    }

    public static makeMoveToAdjacent(actor: LEntity, dir: number): LActivity {
        return (new LActivity()).setup(MRBasics.actions.MoveToAdjacentActionId, actor, undefined, dir);
    }

    public static makeMoveToAdjacentBlock(actor: LEntity, block: LBlock): LActivity {
        //assert(UMovement.blockDistance(actor.x, actor.y, block.x(), block.y()) <= 1);    // 隣接ブロックであること
        assert(UMovement.checkAdjacentPositions(actor.mx, actor.my, block.mx, block.my));    // 隣接ブロックであること
        const dir = SAIHelper.distanceToDir(actor.mx, actor.my, block.mx, block.my);
        return (new LActivity()).setup(MRBasics.actions.MoveToAdjacentActionId, actor, undefined, dir);
    }

    public static makePrimaryUse(subject: LEntity, object: LEntity): LActivity {
        const reaction = object.data.reactions.find(x => x.primariyUse);
        if (reaction) {
            const a = (new LActivity()).setup(reaction.actionId, subject, object);
            return a;
        }
        else {
            return this.make(subject);
        }
    }

    public static makePick(actor: LEntity): LActivity {
        return (new LActivity()).setup(MRBasics.actions.PickActionId, actor);
    }

    public static makePut(actor: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(MRBasics.actions.PutActionId, actor, object);
    }

    public static makeThrow(actor: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(MRBasics.actions.ThrowActionId, actor, object);
    }

    public static makeShooting(actor: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(MRBasics.actions.ShootActionId, actor, object);
    }
    
    public static makeFall(actor: LEntity): LActivity {
        return (new LActivity()).setup(MRBasics.actions.FallActionId, actor);
    }

    public static makeTrample(actor: LEntity): LActivity {
        return (new LActivity()).setup(MRBasics.actions.trample, actor);
    }

    public static makeExchange(actor: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(MRBasics.actions.ExchangeActionId, actor, object);
    }

    public static makeEquip(actor: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(MRBasics.actions.EquipActionId, actor, object);
    }

    public static makeEquipOff(actor: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(MRBasics.actions.EquipOffActionId, actor, object);
    }
    
    public static makeEat(actor: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(MRBasics.actions.EatActionId, actor, object);
    }

    public static makeWave(actor: LEntity, object: LEntity): LActivity {
        return (new LActivity()).setup(MRBasics.actions.WaveActionId, actor, object);
    }

    public static makeRead(actor: LEntity, object: LEntity, targets?: LEntity[]): LActivity {
        const a = (new LActivity()).setup(MRBasics.actions.ReadActionId, actor, object);
        if (targets) a.setObjects2(targets);
        return a;
    }

    public static makePutIn(actor: LEntity, storage: LEntity, items: readonly LEntity[]): LActivity {
        const a = (new LActivity()).setup(MRBasics.actions.PutInActionId, actor, storage);
        a._objects2 = items.map(x => x.entityId());
        return a;
    }

    public static makePickOut(actor: LEntity, storage: LEntity, items: readonly LEntity[]): LActivity {
        const a = (new LActivity()).setup(MRBasics.actions.PickOutActionId, actor, storage);
        a._objects2 = items.map(x => x.entityId());
        return a;
    }

    public static makeTalk(actor: LEntity): LActivity {
        const a = (new LActivity()).setup(MRBasics.actions.talk, actor);
        return a;
    }

    // public static makeCollide(subject: LEntity, target: LEntity): LActivity {
    //     const a = (new LActivity()).setup(MRBasics.actions.collide, subject);
    //     a.setObjects2([target]);
    //     return a;
    // }

    public static makePerformSkill(actor: LEntity, skillId: DSkillId, dirToFace?: number): LActivity {
        assert(skillId > 0);
        const a = (new LActivity()).setup(MRBasics.actions.performSkill, actor);
        if (dirToFace !== undefined) a._effectDirection = dirToFace;
        a._skillId = skillId;
        return a;
    }

    public static makeDialogResult(actor: LEntity, target: LEntity, selectedAction: string): LActivity {
        const a = (new LActivity()).setup(MRBasics.actions.dialogResult, actor, target);
        a._selectedAction = selectedAction;
        return a;
    }
}


/*
[2021/10/20] 動作の予防について
----------
- 転び防止
- 盗み防止
- 爆発防止 (冷え香)
- ワープ防止？

当初これらは ActivityReaction でリジェクトすることで対応しようとしてたが、
これらの効果は EffectBehavior からも発動する必要になってきたためちょっと迷い中。

例えば転ばせは Activity でも実現できるが、起点は Effect となるべき。
転ばぬ先の杖、転び石効果、転び土偶、モンスター特技等から実行される。

実際のところ、転び防止、盗み防止くらいなら EffectBehavior 側で相手の Trait を見て、発動しないだけでよい。
Reaction でリジェクトしたいのは、それ以外の条件によってはじきたいとき。
例えば [話す] は、敵対 Entity ならリジェクトしたい。


### Skill と Activity の違い

今のところ、Activity は Core 外部から入力される行動の起点を示すもので、Recorder で記録されるもの、としている。
また、いくつかの Activity はシステムと強く結びついており、[置く] [交換] などは対象を選択する UI が必要となる。

対して Skill は前準備無しで即 "実行" できる。対象を選択する必要はない。（あるいは事前に狙いをつけたものに対して発動する）。Skill には成否・命中判定が伴う。
Skill は複数の Effect を含むことができるため、[転び] と [盗み] を同時に発動できる。
このため Skill == Activity にはできない。同様に Effect == Activity も NG。
SpecialEffect == Activity ならまだ余地はありそうだが、SpecialEffect はステートやバフ付加など Activity 以外の処理を行いたいこともある。

Skill や Effect は [転び] と [盗み] といったアクションと 1:1 にできないので、やっぱり Activity として再利用はできない。


### 防止効果の指定方法

もし Activity に [転び] と [盗み] といったものを実装するなら、防止 Trait は具体的な [転び防止] [盗み防止] ではなく、
[指定IDのActivity防止] にすることができて、汎用性が上がる。
Actor と Reactor 側どちらかを指定できればなおよい。
これができると "巻物忘れ"([読む]ができない) などの実装も容易になる。
→ 現状、Actor 側は SealActivity で実装済み。


### 何を懸念している？→ [転び] [盗み] は Activity なのか？

消去法によるアイデアなので、ほんとによいかちょっと不安。
[移動] [向き変更] [拾う] [置く] [交換] といった行動までリジェクトできるような仕組みでよいのか？
→ 別に構わないと思うし、実際にこれらはありえそう。
  逆に、無理に別の分類にする意味のほうが薄いかもしれない。

ただ、Activity と効果が 1:1 だと面倒なこともある。
例えば [盗む] と一言にいっても、
- アイテム盗み
- ゴールド盗み
- ついばみ
- すいこみ
- アイテムをつかんで投げ捨てる
等が考えられる。
これら一つずつ Activity と 防止 Trait を用意するのはちょっと面倒だし、設定ミスも起こりやすくなる。
こういったケースではやっぱり [盗み防止] Trait ひとつで対応したいところ。

そうするといくつかの効果をグループ化するような仕組みとなるので、[盗み防止] という具体的な Trait になるのもやむなしか。

これら Trait の説明文としては、
- [盗み] に分類される特殊効果を防止します。
- [転び] に分類される特殊効果を防止します。



*/




