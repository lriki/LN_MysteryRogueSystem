import { assert, RESerializable } from "ts/re/Common";
import { DAutoRemovalTiming, DState, DStateEffect, DStateId } from "ts/re/data/DState";
import { REData } from "ts/re/data/REData";
import { checkContinuousResponse, SCommandResponse } from "ts/re/system/RECommand";
import { LBehaviorId, LObject, LObjectId, LObjectType } from "../LObject";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { LBehavior } from "../behaviors/LBehavior";
import { DParameterId } from "ts/re/data/DParameter";

export type LStateId = LObjectId;

/*
[2021/9/14] 敵・味方で効果の変わるステート
----------

- 案A: 1つのステートを使い、NOTE でマッチ条件を指定する。マッチしなければ GUI の設定にフォールバックする。
- 案B: 2つ以上のステートを使い、スキルやアイテム側の設定として、対象種類ごとに与えるステートを変化させる。
- 案C: 2つ以上のステートを使い、親子関係で表現する。子ステートにマッチするものが無ければ親にフォールバックする。
- 案D: ステートグループを利用する。

まず案Bはよくない。
状態異常ひとつとっても、付与する状況は様々。アイテム効果、スキル効果、罠効果、等…
これらすべての同様の設定を行う必要があるため設定ミスの温床になる。

案Aの場合、Traitの制御が難しい。
味方の場合は Trait.A のみ有効にする。敵の場合は Trait.B のみ有効にする、など。

案Bの場合、例えば透明状態なら
- 透明
    - 透明(プレイヤー) : 混乱なし
    - 透明(エネミー)   : 混乱付き
というように3つのステートを作る必要がある。
データ量は増えるが、NOTE欄ではなくパッと目につく GUI 上に出てくるので、泥臭いけどわかりやすいかも。

案Dはちょっと違うかも。
例えば睡眠状態で、プレイヤーとエネミーでターンが異なる場合を考えてた時。
本来ステートグループは仮眠・睡眠・爆睡のような排他を表現するのに使う。
今回やりたいのは、この個々のステートに対する追加情報とするべき。


### B案をもうちょい詰める

- 透明
    - 透明(プレイヤー) : 混乱なし
    - 透明(エネミー)   : 混乱付き

こういうのがあるとき、実際にアタッチできるのは「透明」だけとしたほうがいいだろう。
そうしないと、「あるEntityに透明ステートがついているか？」を判断するときに条件が増える。
ガワは「透明」実際の効果は「透明(エネミー)」のように、LState の中で透過的に扱えるようにしたほうがいいだろう。


### 敵・味方で効果の変わる効果(スキル)

こちらもステートと同じ仕組みが要るかも。
代表例は爆発。プレイヤー・仲間にはダメージ。敵・アイテムは消滅。

普通の攻撃はアイテムには通らないけど、その辺も制御できるようにする必要がある。
スキルはデフォルトで Unit のみ、条件を追加すればアイテムも可能、とか。
罠壊しはこの仕組みでできるかも。

内部的には、Emittor は同一。Effect が異なる。


[2021/8/29] 封印
----------

モンスターの特性と特殊能力
http://twist.jpn.org/sfcsiren/index.php?%E3%83%A2%E3%83%B3%E3%82%B9%E3%82%BF%E3%83%BC%E3%81%AE%E7%89%B9%E6%80%A7%E3%81%A8%E7%89%B9%E6%AE%8A%E8%83%BD%E5%8A%9B

- "特殊能力" "特性" 共に、ステートを適用するものがある？
    - 上記表では "速度変化" と "AIに関わるもの" だけ。REとしては必ずしもステートとして表現する必要はない。
- 分裂については "特殊能力" "特性" 両方でありえる。


### 特殊能力
- 倍速
- ランダム移動 (※パコレプキンの移動は "特技" に分類される (キグニ状態・めつぶし状態で消える))
    - ただし内部的には AI のオーバーライドなので、上記表に従わなくても実現可。
- 攻撃を受けると分裂
- 逃げ
- 自爆
- 透明
- どろぼう
    - アイテムへ向かって移動する
    - 盗んだ後は逃げAI
- 攻撃を受けるとワープ  はぐれメタル: https://c6h5ch3.hatenadiary.org/entry/20151109/1447032154
- まちぶせ: うごくせきぞう

### 特性
- アイテムを落とす
- 出現時、永続睡眠ステート
- 出現時、常に起きている  (マドハンド)
- 出現時、アイテムに化ける
- 出現時、他モンスターに化ける
- メタル属性   はぐれメタルは封印してもダメージ1: https://c6h5ch3.hatenadiary.org/entry/20151109/1447032154


### 方針

- 特殊能力は "特殊能力Behavior" として実装する。封印状態では、この Behavior へ通知が行われなくなる。

火炎入道や正面戦士の「外見特性」は、REとしては特殊能力に混ぜてしまうことにする。今回は不要だし、実装は大変そう。


*/

/*
[2021/8/25] 混乱
----------
LConfusionAI のコメントに書いた通り、ランダム行動の決定は Behavior 内ではなく AI や Dialog 側で行う。
しかしそうすると ManualActionDialog 上で乱数を生成することになるため、行動履歴と一致しなくなる。

行動履歴は「REシステム外部からのActivity入力を記録する」方法で実現しているため、実質これはキー入力ログ。
混乱を実装するには、これが Behavior に流れる前に１枚レイヤーを挟んで、乱数を使って加工してから Behavior に流さなければならない。
(AI から使う都合もあって、Behavior 内でランダムに方向を変えたりしたくない)

混乱以外ではゾワゾワ状態でもこのフックが必要になる。
催眠やノーコン状態でもあったほうが良いか？
- 基本的に、「状態異常にかかっていたとしても、正常状態のアクティビティを実行したいことがあるか？」がポイントになる。
  イベント実行が主なところか。
- AI に影響があるのか、Activity に影響があるのかは明確にしたほうが良い。
    - 混乱はAI.
    - ゾワゾワ, ノーコンは Activity
- AI というより Dicision と考えたほうがいいかも？
    - 混乱
        - プレイヤーには部分的に影響を与えるもの
        - AI全体を変えるもの
    - バーサーク
    - 催眠
        - プレイヤー・エネミー問わず、 Dicisionを乗っ取る

混乱とゾワゾワが混在した時は？
ゾワゾワ有効になってほしい。ランダムに向いた方向と、実際には逆に何もないところを攻撃してほしい。


[2021/8/23] 速度変化 再考
----------

「重ね掛け可能なターン制限付きバフ」とするか、「ステートグループを組んで排他制御」するか？

前者をベースに考えるのがいいだろう。
本質的にはこっちの方が自然。
倍速モンスターとかは「基本速度」を property として返してもらい、それからの相対的な増減をバフとして表現する。

ステート側は、「戦闘不能」と同じく「パラメータの値によって自動付加」されるものとする。
外部から明示的に「鈍足」「倍速」「３倍速」が付与された場合、強制的にその分だけバフレベルを増やす。

バフは「レベル付きステート」として現す。ゲーム中では隠しステート扱い。
つまり速度変化を構成するステートは次の通り。
- 速度バフ(10ターンで解除, レベル-1,0,1,2, 式は"eva+=level")
- 鈍足(自動付加条件"eva<=-1", 同時付加ステート"速度バフ:-1")
- 倍速(自動付加条件"eva==1", 同時付加ステート"速度バフ:1")
- 3倍速(自動付加条件"eva>=2", 同時付加ステート"速度バフ:2")
- 速度ステートグループ(鈍足, 倍速, 3倍速 を排他)  ※"ステート無効化"でも排他は表現できるが新たな付加ができなくなるので、新たな仕組みが要る。

その他の操作は次の通り。
- バフステートは付加時に絶対・相対でレベルを指定できる。
- 同一パラメータに対して複数のバフステートを定義できる。例えば、解除条件が違うケースを想定する。
- 速度バフを解除するには [速度バフ] ステートを解除する。
- オオイカリ状態等で速度変化を禁止する場合、上記ステートすべてに対する "ステート無効化" を設定する。



[2021/6/29] 予防や排他
----------

- 仮眠 < 睡眠 < 不眠
- スーパー状態は、"悪い状態異常" を受けた時に "確率で解除" される。
    - 悪い状態異常とは？

### 主な予防効果
- 不眠
- オオイカリ (速度変化しなくなる)
- 予防の巻物
グループ化。エディタからは、タグのような感じで指定したい。
上記は、ステート有効度のような感じでタグを指定する感じ。

### 排他
- 目つぶし草・目薬草
- 仮眠・睡眠・爆睡・不眠
- かなしばり < 強烈かなしばり
- 痛み分け < 強烈いたみわけ
- イカリ < オオイカリ
タグの定義側で、排他かどうか設定できるようにしてみようか。

### 重篤化
- ２倍速・倍速・鈍足・かなしばり

かなしばり中に倍速の杖を受けたりすると、かなしばり解除→倍速 になる。
グループ化よりも、重ねがけで別ステートに変化するような設定にしたほうがよさそう？

個々のステートにタグ設定するときに合わせて Level(Priority) を設定できるようにしてみようか。

もしくは、空腹やピンチと同じようにパラメータ評価式に応じて付与するのもありか？
でもターン経過で解除、がやりづらくなりそう？

倍速に関しては、モンスターの基礎的な素質としての倍速と、状態異常の倍速は分けて考える必要がある。
例えば、倍速モンスターに鈍足の杖を振ると等速になるが、何らかの方法で状態異常を解除したら、倍速に戻るべき。
ただその時は鈍足エフェクトは出ないのが悩みどころ…。

速度変化はバフととらえるのがいいかな？もしかして。


### ステート変化
- バクスイ -> 倍速
放置してると重症化するような考え方の方がいいかも。
ターン経過で解除ではなく、別のステートに変化する。


### 特殊な解除条件
- 影縫い < ワープ
- 手封じ
- スーパー
- 仮眠 < 攻撃
- やりすごし < 攻撃
- ふんばり < ピッピッピが隣接している間
- 仮眠1 < 部屋侵入
- 仮眠2 < 攻撃
- 笑い
これらは Trait や Behavior 指定かな。

### 状態異常扱い？
- 空腹
- ピンチ
Traitでダメージ計算式みたいに評価式指定かな。
*/

/**
 * Entity に着脱するステートの単位。
 * 
 * RE において State とは、StateBehavior をグループ化するもの。
 * StateBehavior は仮眠、鈍足など具体的な処理を定義する。
 * 
 * グループ化の仕組みにより、例えば "透視状態になるがハラヘリ速度が倍になる" といった
 * カスタマイズを施しやすくなる。
 * 
 * 振舞いは Ability と非常によく似ているが、State は RMMZ のステートと同じく状態異常を主に表すものであり、
 * 特徴的なところだと "全快" するアイテムやイベントによってすべてでタッチされたりする。
 */
@RESerializable
export class LState extends LObject {
    //private _ownerEntity: LEntity | undefined;    // シリアライズしない
    _stateId: DStateId = 0;
    _submatchEffectIndex: number = -1;
    _stateBehabiors: LBehaviorId[] = []; // LStateTraitBehavior
    _level: number = 0;

    public constructor() {
        super(LObjectType.State);
        REGame.world._registerObject(this);
    }

    public clone(newOwner: LEntity): LState {
        const state = new LState();
        state._stateId = this._stateId;
        state._level = this._level;

        for (const i of this.stateBehabiors()) {
            const i2 = i.clone(newOwner);
            state._stateBehabiors.push(i2.id());
            i2.setParent(this);
        }
        
        return state;
    }

    public setup(stateId: DStateId): void {
        assert(stateId > 0);
        this._stateId = stateId;
    }

    public id(): LStateId {
        return this.__objectId();
    }

    public stateDataId(): DStateId {
        return this._stateId;
    }

    public stateData(): DState {
        return REData.states[this._stateId];
    }

    public stateEffect(): DStateEffect {
        const data = this.stateData();
        
        if (this._submatchEffectIndex >= 0)
            return REData.states[data.submatchStates[this._submatchEffectIndex]].effect;
        else
            return data.effect;
    }

    public submatchEffectIndex(): number {
        return this._submatchEffectIndex;
    }
    
    public stateBehabiors(): readonly LBehavior[] {
        return this._stateBehabiors.map(x => REGame.world.behavior(x) as LBehavior);
    }

    public behaviorIds(): LBehaviorId[] {
        return this._stateBehabiors;
    }

    public level(): number {
        return this._level;
    }

    public setLevel(value: number): void {
        this._level = value;
    }

    /** 全ての Behavior を除外します。 */
    public removeAllBehaviors(): void {
        const self = this.parentObject() as LEntity;
        this.stateBehabiors().forEach(b => {
            b.clearParent();
            b.onDetached(self);
            b.destroy();
        });
        this._stateBehabiors = [];
    }

    //public ownerEntity(): LEntity {
    //    assert(this._ownerEntity);
    //    return this._ownerEntity;
    //}

    //_setOwnerEntty(entity: LEntity) {
    //    this._ownerEntity = entity;
    //}

    recast(): void {
        // 同じ state が add された

    }
    onAttached(self: LEntity): void {
        for (const b of this.stateBehabiors()) {
            b.onAttached(self);
        }
    }

    onDetached(self: LEntity): void {
        for (const b of this.stateBehabiors()) {
            b.onDetached(self);
        }
    }

    public removeThisState(): void {
        const entity = this.parentAs(LEntity);
        if (entity) {
            entity.removeState(this._stateId);
        }
    }

    public collectTraits(self: LEntity, result: IDataTrait[]): void {
        this.stateEffect().traits.forEach(x => result.push(x));
        this.iterateBehaviors(x => {
            x.onCollectTraits(self, result);
            return true;
        });
    }

    public iterateBehaviors(func: ((b: LBehavior) => void) | ((b: LBehavior) => boolean)): boolean {
        for (const id of this._stateBehabiors) {
            if (func(REGame.world.behavior(id)) === false) return false;
        }
        return true;
    }

    // deprecated:
    _callStateIterationHelper(func: (x: LBehavior) => SCommandResponse): SCommandResponse {
        let response = SCommandResponse.Pass;
        for (let i = this._stateBehabiors.length - 1; i >= 0; i--) {
            const behavior = (REGame.world.behavior(this._stateBehabiors[i]) as LBehavior);
            const r = func(behavior);
            if (r != SCommandResponse.Pass) {
                response = r;
            }
            if (checkContinuousResponse(r)) {
                break;
            }
        }
        return response;
    }

    //------------------------------------------------------------------------------
    //


    public checkRemoveAtDamageTesting(paramId: DParameterId): boolean {
        for (const r of this.stateEffect().autoRemovals) {
            if (r.kind == DAutoRemovalTiming.DamageTesting && r.paramId == paramId) {
                return true;
            }
        }
        return false;
    }
}

export class LStateEffectView {

}

