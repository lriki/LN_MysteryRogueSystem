import { assert } from "ts/Common";
import { DState, DStateId } from "ts/data/DState";
import { REData } from "ts/data/REData";
import { checkContinuousResponse, REResponse } from "ts/system/RECommand";
import { LBehaviorId, LObject, LObjectId, LObjectType } from "../LObject";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { LBehavior } from "../behaviors/LBehavior";

export type LStateId = LObjectId;

/*
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
export class LState extends LObject {
    //private _ownerEntity: LEntity | undefined;    // シリアライズしない
    _stateId: DStateId = 0;
    _stateBehabiors: LBehaviorId[] = []; // LStateTraitBehavior

    public constructor() {
        super(LObjectType.State);
        REGame.world._registerObject(this);
    }

    public clone(newOwner: LEntity): LState {
        const state = new LState();
        state._stateId = this._stateId;

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

    public stateId(): number {
        return this._stateId;
    }

    public stateData(): DState {
        return REData.states[this._stateId];
    }
    
    public stateBehabiors(): readonly LBehavior[] {
        return this._stateBehabiors.map(x => REGame.world.behavior(x) as LBehavior);
    }

    public behaviorIds(): LBehaviorId[] {
        return this._stateBehabiors;
    }

    /** 全ての Behavior を除外します。 */
    public removeAllBehaviors(): void {
        this.stateBehabiors().forEach(b => {
            b.clearParent();
            b.onDetached();
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
    onAttached(): void {
        this._stateBehabiors.forEach(b => {
            //b._ownerEntityId = this.ownerEntity().id();
            //b._setOwnerObjectId(this.objectId());
            (REGame.world.behavior(b) as LBehavior).onAttached();
        });
    }

    onDetached(): void {
        this.stateBehabiors();
    }

    public removeThisState(): void {
        const entity = this.parentAs(LEntity);
        if (entity) {
            entity.removeState(this._stateId);
        }
    }

    public collectTraits(result: IDataTrait[]): void {
        this.stateData().traits.forEach(x => result.push(x));
        this.iterateBehaviors(x => x.onCollectTraits(result));
    }

    public iterateBehaviors(func: (b: LBehavior) => void): void {
        for (const id of this._stateBehabiors) {
            func(REGame.world.behavior(id));
        }
    }

    // deprecated:
    _callStateIterationHelper(func: (x: LBehavior) => REResponse): REResponse {
        let response = REResponse.Pass;
        for (let i = this._stateBehabiors.length - 1; i >= 0; i--) {
            const behavior = (REGame.world.behavior(this._stateBehabiors[i]) as LBehavior);
            const r = func(behavior);
            if (r != REResponse.Pass) {
                response = r;
            }
            if (checkContinuousResponse(r)) {
                break;
            }
        }
        return response;
    }
}

