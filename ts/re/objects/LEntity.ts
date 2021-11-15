import { DecisionPhase, LBehavior, LBehaviorGroup, LGenerateDropItemCause, LNameView, LParamMinMaxInfo, SRejectionInfo } from "./behaviors/LBehavior";
import { REGame } from "./REGame";
import { SCommandResponse, SPhaseResult } from "../system/RECommand";
import { SCommandContext } from "../system/SCommandContext";
import { LRoomId } from "./LBlock";
import { RESystem } from "ts/re/system/RESystem";
import { DState, DStateId } from "ts/re/data/DState";
import { assert, RESerializable } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { LBehaviorId, LEntityId, LObject, LObjectId, LObjectType } from "./LObject";
import { LState, LStateId } from "./states/LState";
import { LEffectResult } from "ts/re/objects/LEffectResult";
import { DActionId } from "ts/re/data/DAction";
import { LAbility, LAbilityId } from "./abilities/LAbility";
import { DAbilityId } from "ts/re/data/DAbility";
import { LActivity } from "./activities/LActivity";
import { LFloorId } from "./LFloorId";
import { SStateFactory } from "ts/re/system/SStateFactory";
import { LParty, LPartyId } from "./LParty";
import { isThisTypeNode, LanguageServiceMode } from "typescript";
import { DParameterId, DSParamId, DXParamId } from "ts/re/data/DParameter";
import { SAbilityFactory } from "ts/re/system/SAbilityFactory";
import { DFactionId, REData } from "ts/re/data/REData";
import { DEntity, DEntityId, DEntityNamePlate, DIdentificationDifficulty } from "ts/re/data/DEntity";
import { DPrefabActualImage } from "ts/re/data/DPrefab";
import { DEventId } from "ts/re/data/predefineds/DBasicEvents";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { LParamSet } from "./LParam";
import { UState } from "ts/re/usecases/UState";
import { DEffect, DParamBuff, DSubEffectTargetKey, LStateLevelType } from "ts/re/data/DEffect";
import { DSequelId } from "../data/DSequel";
import { LReward } from "./LReward";
import { DBlockLayerKind, DEffectBehaviorId, DEntityKindId } from "../data/DCommon";
import { LActionToken } from "./LActionToken";
import { LPriceInfo, LStructureId } from "./LCommon";
import { LShopArticle } from "./LShopArticle";
import { DEntityKind } from "../data/DEntityKind";
import { DTraitId } from "../data/DTraits";
import { SActivityContext } from "../system/SActivityContext";

enum BlockLayer
{
    /** 地形情報。壁・水路など。 */
    Terrain,

    /** 地表に落ちているもの。アイテム・ワナ・階段など。 */
    Surface,

    /** ユニット。PC・仲間・モンスター・土偶など。 */
    Unit,

    /** 発射物。矢、魔法弾、吹き飛ばされたUnitなど。 */
    Projectile,
}

export interface LParamMinMax {
    min: number;
    max: number;
}

/**
 * [2021/5/27] 祝福・呪い・封印
 * ----------
 * ### 印にするべきか？
 * シレンタイトルでは 2 だけこのパターン。
 * 印であることを利用した予防やモンスター対策など小技があるが、印を埋めると無害化できるので
 * このパターンはかなりプレイヤーに有利なルールと言える。
 * また性質上、装備品以外は呪い状態にできないのであんまりよくないかも。
 * 
 * ### State にするべきか？独立したパラメータにするべきか？
 * これら3ステートは排他なので state にした場合はその上書きや解除の処理が必要になる。
 * 
 * また例えば祝福は草など他のアイテム効果を高めるだけでなく、祝福状態自体に「一定確率で呪いを防ぐ」みたいな効果もある。
 * 祝福によるダメージ増加、効果2倍などはそれぞれ 武器、草アイテム Entity 側で、祝福されているかどうかをチェックして対応するべき。
 * でも呪い防止は祝福自体の効果なので、Behavior にするべきだろう。
 * RMMZ の仕組みの上に乗っているのでステート有効度で制御できるようにもなる。
 */

/**
 * システムを構成する最も原始的な要素。
 * プレイヤー、仲間、モンスター、アイテム、ワナ、地形、飛翔体（矢、魔法弾）などの、状態をもちえるすべての要素のベースクラス。
 *
 * 複数の Attribute や Behavior をアタッチすることで、動作を定義していく。
 * 
 * Entity のライフサイクル
 * ----------
 * - インスタンスの作成は newEntity() で行う。
 *   - すべての Entity は必ず World に存在することになる。
 * - 破棄は destroy()。 ※直ちにインスタンスが削除されるのではなく、削除マークが付けられ、後で削除される。
 * 
 * @note
 * BlockLayer は種別のような他の情報から求めるべきかもしれないが、Entity によっては固定されることは無い。
 * - アイテム変化するモンスターは自身の種別を変更することになるが、それだと BlockLayer を変更することと変わらない。
 * - アイテムとして持っている土偶を立てたときは、振舞いは Item から Unit に変わる。これも結局状態変更することと変わらない。
 * 
 * @note
 * 以前オブジェクトの参照と寿命管理のために LObject をベースクラスとし、Entity だけではなく Map 等もその派生としていたことがあったが、
 * セーブデータ作成や、World から Entity を検索するとき等の書き方が非常に煩雑になってしまったため廃止した。
 * 
 * 
 * 
 * 座標と Map 上への配置状況について
 * ----------
 * 
 * 座標 x,y のマイナス値は正当な値。これは、Floor 内には存在しているが Map 上には配置されていない状態を示す。
 * イメージとしては、概念として存在しているが、現実世界に登場していない状態。
 * お店のセキュリティシステムなど、Map 上に存在する必要はないが Floor 内に存在し、影響を与える Entity でこの状態になることがある。
 * また、フロア移動 ～ Map 上へ配置までの間では、通常の Entity も一時的にこの状態になることがある。
 */
@RESerializable
export class LEntity extends LObject
{
    private _entityDataId: DEntityId = 0;

    private _params: LParamSet;
    private _basicBehaviors: LBehaviorId[] = [];    // Entity 生成時にセットされる基本 Behavior. Entity 破棄まで変更されることは無い。

    /**
     * この Entity 個体として識別済みであるか。
     */
    private _individualIdentified: boolean = false;

    _partyId: LPartyId = 0;
    
    //private _parentIsMap = false;

    public constructor() {
        super(LObjectType.Entity);
        this._params = new LParamSet();
    }

    public setupInstance(entityDataId: DEntityId): void {
        if (this._entityDataId > 0) {
            // Change Instance

            this.clearInstance();
            this._entityDataId = entityDataId;
            SEntityFactory.buildEntity(this);

            // 現在マップ上での変更であれば、再出現の処理を回すことで、見た目もリセットする
            if (this.floorId.equals(REGame.map.floorId())) {
                RESystem.integration.entityReEnterMap(this);
            }
        }
        else {
            this._entityDataId = entityDataId;
        }

        // 初期識別状態
        this._individualIdentified = (this.data().identificationDifficulty == DIdentificationDifficulty.Clear);

        this._params.clear();
        const params = this.data().idealParams;
        for (let i = 0; i < params.length; i++) {
            const value = params[i];
            if (value !== undefined) {
                const param = this._params.acquireParam(i);
                param.setActualDamgeParam(this.idealParam(i) - value);
            }
        }
        this.resetInitialActualParam();
    }

    //----------------------------------------
    // Object Reference Management
    
    public dataId(): DEntityId {
        return this._entityDataId;
    }

    public data(): DEntity {
        return REData.entities[this._entityDataId];
    }

    public kindDataId(): DEntityKindId {
        return this.data().entity.kindId;
    }

    public kindData(): DEntityKind {
        return REData.entityKinds[this.data().entity.kindId];
    }

    public entityId(): LEntityId {
        //return this._id;
        return this.__objectId();
    }

    public equals(other: LEntity): boolean {
        return this.entityId().equals(other.entityId());
    }

    public isGCReady(): boolean {
        // 何らかのフロア上にいる場合は削除されない (明示的に除外されなければならない)
        if (this.floorId.hasAny()) return false;

        return super.isGCReady();
    }

    // public _setObjectId(id: LObjectId): void  {
    //     super._setObjectId(id);
    //     this._params._ownerId = id.clone();
    // }

    


    _name: string = ""; // 主にデバッグ用

    // HC3 で作ってた CommonAttribute はこっちに持ってきた。
    // これらは Entity ごとに一意であるべきで、Framework が必要としている必須パラメータ。
    // Attribute よりはこっちに置いた方がいいだろう。
    _displayName: string = '';
    _iconName: string = '';
    //_blockLayer: BlockLayer = BlockLayer.Unit;

    rmmzEventId: number = 0;

    /**
     * 固定マップにおいて、エディタで配置したイベントを元に作られた Entity であるかどうか。
     * 
     * 基本的には Database マップの Event をコピーして使いたいが、固定の出口、固定NPC、その他未知の固定イベントの設置は考えられる。
     * 特に固定出口はツクールのエディタから「場所移動」によって遷移先を決めるのに都合がよいため、静的 Event と Entity は関連付けておきたい。
     * 
     * 注意点としては、一度 map から離れると静的 Event との関連付けが解除されること。
     * 例えば固定のアイテムが落ちていたとして、それを拾って再び置いたときは、Entity は同一だが異なる動的 Event と関連付けられる。
     * 仮に階段をインベントリに入れてからまた置くと、「場所移動」実行内容が定義されている Event との関連付けが解除されるため、移動ができなくなる。
     * これは現状の仕様とする。
     */
    inhabitsCurrentFloor :boolean = false;

    // HC3 までは PositionalAttribute に持たせていたが、こっちに持ってきた。
    // お店のセキュリティシステムなど、これらを使わない Entity もあるのだが、
    // ほとんどの Entity が持つことになるパラメータなので、Attribute にするとコードが複雑になりすぎる。

    /**
     * Entity が存在しているフロア。
     * 
     * 0 は、World には存在しているがいずれの Floor(Map) 上にもいないことを示し、
     * これは通常、別 Entity の Inventory の中にいる状態。
     * 
     * 直接変更禁止。transfarMap を使うこと
     */
    floorId: LFloorId = LFloorId.makeEmpty();
    x: number = 0;          /**< 論理 X 座標。マイナス値は正当（クラスコメント参照） */
    y: number = 0;          /**< 論理 Y 座標。マイナス値は正当（クラスコメント参照） */

    //--------------------
    // 以下、一時的に Entity に直接持たせてる Attr. 利用率とかで、別途 Attr クラスに分けたりする。

    dir: number = 2;        // Numpad Dir

    // Block を占有するかどうか
    blockOccupied: boolean = true;

    // 隣接移動直後の DialogOpend かどうか。
    // 階段などの Entity に対しては足元コマンドを自動表示したりする。
    // ユーザビリティのためだけに参照する点に注意。セーブデータをロードした直後はウィンドウを表示したりしたくないので、セーブデータに含まれる。
    immediatelyAfterAdjacentMoving: boolean = false;
    
    // Unit の状態異常のほか、アイテムの呪い、祝福、封印などでも使用する。
    // とりあえず Entity に持たせて様子見。
    _states: LStateId[] = [];
    _needVisualRefresh: boolean = false;
    
    _abilities: LAbilityId[] = [];

    // EffectResult はコアスクリプトの ActionResult 同様、System ではなく Entity 側に持たせてみる。
    // EffectContext に持たせて持ちまわってもよいのだが、ステート変更やパラメータ増減など様々なタイミングで参照されるため
    // それらすべての関数で EffectContext を持ちまわるのはかなり煩雑なコードになってしまう。
    _effectResult: LEffectResult = new LEffectResult();
    _reward: LReward = new LReward();


    _located: boolean = false;

    _actionToken: LActionToken = new LActionToken();


    /**
     * この Entity のクローンを作成し、World に登録する。
     * Behavior, State など子要素もディープクローンされる。
     * クローンは特定の親に属していない状態となるため、このあと直ちにマップ上への配置やインベントリへの追加などを行うこと。
     * そうしなければ GC により削除される。
     */
    public clone(): LEntity {
        const entity = REGame.world.spawnEntity(this._entityDataId);
        entity._partyId = this._partyId;
        entity._individualIdentified = this._individualIdentified;
        entity._name = this._name;
        entity._displayName = this._displayName;
        entity._iconName = this._iconName;
        entity.rmmzEventId = 0; // 固定マップのイベントを参照するわけではないのでリセット
        entity.inhabitsCurrentFloor = false;    // true のまま引き継いでしまうと、新たに生成された Entity に対応する RMMZ Event が生成されない
        entity.floorId = LFloorId.makeEmpty();
        entity.x = 0;
        entity.y = 0;
        entity.dir = this.dir;
        entity._actionToken = this._actionToken.clone();   
        entity._stackCount = this._stackCount;  // "分裂" という意味ではスタック数もコピーしてもよさそう。TODO: タイトル要求と大きくかかわるのでオプションにした方がいいかも。
        //entity.blockOccupied = this.blockOccupied;
        //entity.immediatelyAfterAdjacentMoving = this.immediatelyAfterAdjacentMoving;
        //entity._effectResult = new LEffectResult();
        //entity._actionConsumed = this._actionConsumed;
        //entity._located = this._located;
        entity._params.copyTo(this._params);
        entity._needVisualRefresh = true;   // とりあえず
        entity._dropItemGenerated = false;  // 新しく現れた Entity は drop の可能性がある



        for (const i of this.basicBehaviors()) {
            const i2 = i.clone(entity);
            entity._basicBehaviors.push(i2.id());
            i2.setParent(entity);
        }
        for (const i of this.states()) {
            const i2 = i.clone(entity);
            entity._states.push(i2.id());
            i2.setParent(entity);
        }
        for (const i of this.abilities()) {
            const i2 = i.clone(entity);
            entity._abilities.push(i2.id());
            i2.setParent(entity);
        }

        return entity;
    }

    onFinalize(): void {
        // 現在マップ上の Entity 削除
        if (this.floorId.equals(REGame.map.floorId())) {
            REGame.map._removeEntity(this);
        }
        this.clearInstance();
        REGame.scheduler.invalidateEntity(this);
    }

    private clearInstance(): void {
        this.removeAllBehaviors();
        //this.removeAllAbilities();    // TODO: assert するのでコメントアウト
        this.removeAllStates();
    }

    protected onRemoveChild(obj: LObject): void {
        if (obj instanceof LEntity) {
            for (const b of this.basicBehaviors()) {
                b.onRemoveChild(obj);
            }
        }
        //else if (obj instanceof LBehavior) {
        //    for (const b of this.basicBehaviors()) {
        //        b.onRemoveChild(obj);
        //    }
        //}
        else {
            // TODO: State とか Ability とか
            throw new Error("Not implemented.");
        }
    }
    
    protected onRemoveFromParent(): void {
        for (const b of this.basicBehaviors()) {
            b.onOwnerRemoveFromParent(this);
        }
    }

    parentEntity(): LEntity | undefined {
        if (this.parentObjectId().hasAny()) {
            return REGame.world.entity(this.parentObjectId());
        }
        else {
            return undefined;
        }
    }

    public isPlayer(): boolean {
        return this.entityId().equals(REGame.camera.focusedEntityId());
    }

    public partyId(): LPartyId {
        return this._partyId;
    }

    public party(): LParty | undefined {
        if (this._partyId == 0)
            return undefined;
        else
            return REGame.world.party(this._partyId);
    }

    public individualIdentified(): boolean {
        return this._individualIdentified;
    }

    public setIndividualIdentified(value: boolean): void {
        this._individualIdentified = value;
    }

    //--------------------------------------------------------------------------------
    // Parameters

    public params(): LParamSet {
        return this._params;
    }

    // 現在の上限値。
    // システム上、HP,MP 等のほか、攻撃力、満腹度など様々なパラメータの減少が発生するため、
    // RMMZ のような _hp, _mp, _tp といったフィールドは用意せず、すべて同じように扱う。
    // Game_BattlerBase.prototype.param
    public idealParam(paramId: DParameterId): number {
        const a1 = this.idealParamBasePlus(paramId);
        const a2 = this.idealParamRate(paramId);
        const a3 =  this.paramBuffRate(paramId);
        const a4 = this.paramBuffPlus(paramId);
        const value =
            a1 *
            a2 *
            a3 +
            a4;
        const maxValue = this.paramMax(paramId);
        const minValue = this.paramMin(paramId);
        return Math.round(value.clamp(minValue, maxValue));
    }

    // 現在のレベルやクラスに応じた基礎値。
    // 例えば FP だと常に 100. バフやアイテムによる最大 FP 上昇量は含まない。
    // Game_BattlerBase.prototype.paramBase
    private idealParamBase(paramId: DParameterId): number {
        const data = REData.parameters[paramId];
        const battlerParam = data.battlerParamId;
        if (battlerParam >= 0) {
            return this.getIdealParamBase(paramId);
        }
        else {
            return data.initialIdealValue;
        }
    }

    // Game_BattlerBase.prototype.paramPlus
    // 成長アイテム使用による、半永久的な上限加算値
    public idealParamPlus(paramId: DParameterId): number {
        const param = this._params.param(paramId);
        return (param) ? param.idealParamPlus() + this.queryIdealParameterPlus(paramId) : 0;
    }

    // Game_BattlerBase.prototype.paramBasePlus
    public idealParamBasePlus(paramId: DParameterId): number {
        return this.idealParamBase(paramId) + this.idealParamPlus(paramId);
        //return Math.max(0, this.idealParamBase(paramId) + this.idealParamPlus(paramId));
    }
    
    // Game_BattlerBase.prototype.paramRate
    public idealParamRate(paramId: DParameterId): number {
        return this.traitsPi(REBasics.traits.TRAIT_PARAM, paramId);
    }

    // Game_BattlerBase.prototype.paramBuffRate
    // バフ適用レベル (正負の整数値。正規化されたレートではない点に注意)
    public paramBuffRate(paramId: DParameterId): number {
        const param = this._params.param(paramId);
        if (param) {
            return (param.buff() * 0.25 + 1.0) * param.buffRate();
        }
        else {
            return 1.0;
        }
    }

    public paramBuffPlus(paramId: DParameterId): number {
        const param = this._params.param(paramId);
        return (param) ? param.buffPlus() : 0;
    }
    
    // バフや成長によるパラメータ上限値の最小値。
    // 現在の上限値を取得したいときは idealParam() を使うこと。
    // Game_BattlerBase.prototype.paramMin
    public paramMin(paramId: DParameterId): number {
        const data = REData.parameters[paramId];
        return data ? data.minValue : 0;
    };
    
    // バフや成長によるパラメータ上限値の最大値。
    // 現在の上限値を取得したいときは idealParam() を使うこと。
    // Game_BattlerBase.prototype.paramMax
    public paramMax(paramId: DParameterId): number {
        const data = REData.parameters[paramId];
        return data ? data.maxValue : Infinity;
    };

    public actualParam(paramId: DParameterId): number {
        const param = this._params.param(paramId);
        const value = (param) ? this.idealParam(paramId) - param.actualParamDamge() : 0;
        
        const maxValue = this.paramMax(paramId);
        const minValue = this.paramMin(paramId);
        return Math.round(value.clamp(minValue, maxValue));
    }

    /** 直接設定 */
    public setActualParam(paramId: DParameterId, value: number): void {
        const max = this.idealParam(paramId);
        this.setActualDamgeParam(paramId, max - value);
    }

    public setActualDamgeParam(paramId: DParameterId, value: number): void {
        const param = this._params.param(paramId);
        if (param) {
            param.setActualDamgeParam(value);
            this.refreshConditions();
        }
        else {
            throw new Error(`LParam not registerd (paramId:${paramId})`);
        }
    }
    
    public gainActualParam(paramId: DParameterId, value: number): void {
        if (value === 0) return;    // refresh とか発生させる意味なし

        const param = this._params.param(paramId);
        if (param) {
            param.gainActualParam(value);
            this.refreshConditions();
        }
        else {
            throw new Error(`LParam not registerd (paramId:${paramId})`);
        }
    }

    private resetInitialActualParam(): void {
        for (const param of this._params.params()) {
            if (param) {
                param.resetInitialActualValue(this.actualParam(param.parameterId()));
            }
        }
    }

    public refreshConditions(): void {
        // 外部から addState() 等で DeathState が与えられた場合は HP0 にする
        const hpParam = this._params.param(REBasics.params.hp);
        if (hpParam) {
            const dead = !!this.states().find(s => s.stateDataId() == REBasics.states.dead || s.stateData().deadState);//this.isDeathStateAffected();
            const hp = this.actualParam(REBasics.params.hp);
            if (dead && hp != 0) {
                hpParam.setActualDamgeParam(this.idealParam(REBasics.params.hp));
                this.removeAllStates();
            }
        }

        this._params.refresh(this);
        this.basicBehaviors().forEach(b => b.onRefreshConditions());
        
    
        // refresh 後、HP が 0 なら DeadState を付加する
        if (this.idealParam(REBasics.params.hp) !== 0) {
            if (this.actualParam(REBasics.params.hp) === 0) {
                this.addState(REBasics.states.dead, false);
            } else {
                if (this.isStateAffected(REBasics.states.dead)) {   // removeState() はけっこういろいろやるので、不要なら実行しない
                    this.removeState(REBasics.states.dead);
                }
            }
        }

        // ステートの Refresh
        this._states = UState.resolveStates(this, [], []).map(s => s.id());
    }
    
    //--------------------------------------------------------------------------------
    // Buff

    public addBuff(buff: DParamBuff): void {
        const param = this._params.param(buff.paramId);
        if (param) {
            param.addBuff(buff);
            this.refreshConditions();
            this._effectResult.pushAddedBuff(buff.paramId);
        }
    }

    public removeBuff(paramId: DParameterId): void {
        const param = this._params.param(paramId);
        if (param) {
            param.removeBuff();
            this.refreshConditions();
            this._effectResult.pushRemovedBuff(paramId);
        }
    }


    //----------------------------------------
    // Traits
    
    // Game_BattlerBase.prototype.allTraits
    private allTraits(): IDataTrait[] {
        return this.collectTraits();
    }

    // Game_BattlerBase.prototype.traits
    public traits(code: number): IDataTrait[] {
        return this.allTraits().filter(trait => trait.code === code);
    }

    public hasTrait(code: DTraitId): boolean {
        return this.allTraits().find(t => t.code == code) !== undefined;
    }

    // Game_BattlerBase.prototype.traitsWithId
    public traitsWithId(code: number, id: number): IDataTrait[] {
        return this.allTraits().filter(
            trait => trait.code === code && trait.dataId === id
        );
    }

    // Game_BattlerBase.prototype.traitsPi
    public traitsPi(code: number, id: number): number {
        return this.traitsWithId(code, id).reduce((r, trait) => r * trait.value, 1);
    }

    // Game_BattlerBase.prototype.traitsSum
    public traitsSum(code: number, id: number): number {
        const traits = this.traitsWithId(code, id);
        return traits.reduce((r, trait) => r + trait.value, 0);
    }

    public traitsSumOrDefault(code: number, id: number, defaultValue: number): number {
        const traits = this.traitsWithId(code, id);
        return (traits.length == 0) ? defaultValue : traits.reduce((r, trait) => r + trait.value, 0);
    }

    // Game_BattlerBase.prototype.traitsSumAll
    private traitsSumAll(code: number): number {
        return this.traits(code).reduce((r, trait) => r + trait.value, 0);
    }
    
    // Game_BattlerBase.prototype.traitsSet
    // 指定した code の Trait の dataId のリストを返す
    private traitsSet(code: number): number[] {
        //const emptyNumbers: number[] = [];
        //return this.traits(code).reduce((r, trait) => r.concat(trait.dataId), emptyNumbers);
        const result = [];
        for (const trait of this.traits(code)) {
            result.push(trait.dataId);
        }
        return result;
    }

    // Game_BattlerBase.prototype.xparam
    public xparam(xparamId: DXParamId): number {
        return this.traitsSum(REBasics.traits.TRAIT_XPARAM, xparamId);
    }

    public xparamOrDefault(xparamId: DXParamId, defaultValue: number): number {
        return this.traitsSumOrDefault(REBasics.traits.TRAIT_XPARAM, xparamId, defaultValue);
    }
    
    // Game_BattlerBase.prototype.sparam
    public sparam(sparamId: DSParamId): number  {
        return this.traitsPi(REBasics.traits.TRAIT_SPARAM, sparamId);
    }

    // Game_BattlerBase.prototype.elementRate
    public elementRate(elementId: number): number {
        return this.traitsPi(REBasics.traits.TRAIT_ELEMENT_RATE, elementId);
    }

    // ステート有効度
    // Game_BattlerBase.prototype.stateRate
    public stateRate(stateId: DStateId): number {
        return this.traitsPi(REBasics.traits.TRAIT_STATE_RATE, stateId);
    };
    
    // Game_BattlerBase.prototype.attackElements
    public attackElements(): number[] {
        return this.traitsSet(REBasics.traits.TRAIT_ATTACK_ELEMENT);
    }


    //----------------------------------------
    // Property

    public getDisplayName(): LNameView {
        for (const b of this.collectBehaviors().reverse()) {
            const v = b.queryDisplayName();
            if (v) return v;
        }
        const data = this.data();
        let name = data.makeDisplayName(this._stackCount);

        const result: LNameView = { name: name, iconIndex: data.display.iconIndex, upgrades: 0 };

        const upgrades = this._params.param(REBasics.params.upgradeValue);
        if (upgrades) {
            result.upgrades = this.actualParam(REBasics.params.upgradeValue);
        }

        // TODO: test
        const remaining = this._params.param(REBasics.params.remaining);
        if (remaining) {
            result.capacity = this.actualParam(REBasics.params.remaining);
            result.initialCapacity = remaining.initialActualValue();
        }

        return result;
    }

    public getCharacterImage(): DPrefabActualImage | undefined {
        for (const b of this.collectBehaviors().reverse()) {
            const v = b.queryCharacterFileName();
            if (v) return v;
        }
        return undefined;
    }
    
    // this が真に属する Faction。通常、getOutwardFactionId() を使うべき。
    public getInnermostFactionId(): DFactionId {
        for (const b of this.collectBehaviors().reverse()) {
            const v = b.queryInnermostFactionId();
            if (v) return v;
        }
        return REData.system.factions.neutral;
    }

    // 対外的な Faction。モンスターがアイテムに化けているといった場合、InnermostFactionId とは異なる値を返す。
    public getOutwardFactionId(): DFactionId {
        for (const b of this.collectBehaviors().reverse()) {
            const v = b.queryOutwardFactionId();
            if (v) return v;
        }
        return REData.system.factions.neutral;
    }

    public getHomeLayer(): DBlockLayerKind {
        for (const b of this.collectBehaviors().reverse()) {
            const v = b.queryHomeLayer();
            if (v) return v;
        }
        return DBlockLayerKind.Ground;
    }

    public getIdealParamBase(paramId: DParameterId): number {
        let value = 0;
        this.iterateBehaviorsReverse(b => {
            value = b.onQueryIdealParamBase(paramId, value);
            return true;
        });
        return value;
    }

    public querySubEntities(key: DSubEffectTargetKey): LEntity[] {
        const result: LEntity[] = [];
        this.iterateBehaviorsReverse(b => {
            b.onQuerySubEntities(key, result);
            return true;
        });
        return result;
    }

    public queryParamMinMax(paramId: DParameterId): LParamMinMax {
        const param = REData.parameters[paramId];
        const result: LParamMinMax = { min: param.minValue, max: param.maxValue };
        if (paramId == REBasics.params.upgradeValue) {
            const data = this.data();
            result.min = data.upgradeMin;
            result.max = data.upgradeMax;
        }
        /*
        this.iterateBehaviorsReverse(b => {
            const r: LParamMinMaxInfo = {};
            b.onQueryParamMinMax(paramId, r);
            if (r.min) result.min = r.min;
            if (r.max) result.max = r.max;
            return true;
        });
        */
        return result;
    }

    public queryPrice(): LPriceInfo {
        const data = this.data();
        const result: LPriceInfo = { cellingPrice: data.cellingPrice2, purchasePrice: data.purchasePrice };
        this.iterateBehaviorsReverse(b => {
            b.onQueryPrice(result);
            return true;
        });
        return result;
    }

    //----------------------------------------
    // Behavior

    private basicBehaviors(): LBehavior[] {
        return this._basicBehaviors.map(x => REGame.world.behavior(x));
    }

    
    public addBehavior<T extends LBehavior>(ctor: { new(...args: any[]): T }, ...args: any[]): T {
        const behavior = new ctor();
        (behavior as T).setup(...args);
        REGame.world._registerObject(behavior);
        this._addBehavior(behavior);
        return behavior;
    }

    _addBehavior(behavior: LBehavior) {
        assert(behavior.hasId());
        assert(this.entityId().hasAny());
        this._basicBehaviors.push(behavior.id());
        behavior.setParent(this);
        behavior.onAttached(this);
        return behavior;
    }

    removeBehavior(behavior: LBehavior) {
        const index = this._basicBehaviors.findIndex(x => x.equals(behavior.id()));
        if (index >= 0) {
            this._basicBehaviors.splice(index, 1);
            behavior.clearParent();
            behavior.onDetached(this);
            behavior.destroy();
        }
    }

    /** 全ての Behavior を除外します。 */
    public removeAllBehaviors(): void {
        this.basicBehaviors().forEach(b => {
            b.clearParent();
            b.onDetached(this);
            b.destroy();
        });
        this._basicBehaviors = [];
    }



    //--------------------------------------------------------------------------------
    // State

    addState(stateId: DStateId, refresh: boolean = true, level: number = 1, levelType: LStateLevelType = LStateLevelType.RelativeValue) {

        if (levelType == LStateLevelType.AbsoluteValue && level == 0) return;   // level=0 となる場合は設定不要

        this._states = UState.resolveStates(this, [{ stateId: stateId, level: level, levelType: levelType }], []).map(s => s.id());

        // 自動追加の更新を行う
        this._states = UState.resolveStates(this, [], []).map(s => s.id());
        this._needVisualRefresh = true;
    }

    public states(): readonly LState[] {
        return this._states.map(id => REGame.world.object(id) as LState);
    }

    public isStateAffected(stateId: DStateId): boolean {
        return this.states().findIndex(s => s.stateDataId() == stateId) >= 0;
    }

    public removeStates(stateIds: DStateId[]) {
        this._states = UState.resolveStates(this, [], stateIds).map(s => s.id());

        // 自動追加の更新を行う
        this._states = UState.resolveStates(this, [], []).map(s => s.id());
        this._needVisualRefresh = true;
    }

    removeState(stateId: DStateId) {
        this.removeStates([stateId]);
    }

    /** 全ての State を除外します。 */
    public removeAllStates(): void {
        this.states().forEach(s => {
            s.clearParent();
            s.onDetached(this);
        });
        this._states = [];
        this._needVisualRefresh = true;
    }

    public findState(stateId: DStateId): LState | undefined {
        let result: LState | undefined = undefined;
        this.iterateStates((s) => {
            if (s.stateDataId() == stateId) {
                result = s;
                return false;
            }
            return true;
        });
        return result;
    }

    public hasState(stateId: DStateId): boolean {
        return !!this.findState(stateId);
    }
    
    public isBlessed(): boolean {
        return this.isStateAffected(REData.system.states.bless);
    }

    public isCursed(): boolean {
        return this.isStateAffected(REData.system.states.curse);
    }

    public isSealed(): boolean {
        return this.isStateAffected(REData.system.states.seal);
    }


    // Game_BattlerBase.prototype.isDeathStateAffected
    isDeathStateAffected(): boolean {
        return !!this.states().find(s => s.stateDataId() == REBasics.states.dead || s.stateData().deadState);
        //return this.isStateAffected(REBasics.states.dead);
    }

    // Game_Battler.prototype.isStateAddable
    public isStateAddable(stateId: DStateId): boolean {
        return !this.isStateResist(stateId);
        // return (
        //     this.isAlive() &&
        //     $dataStates[stateId] &&
        //     !this.isStateResist(stateId) &&
        //     !this.isStateRestrict(stateId)
        // );
    }

    // Game_BattlerBase.prototype.stateResistSet
    public stateResistSet(): DStateId[] {
        return this.traitsSet(REBasics.traits.TRAIT_STATE_RESIST);
    }
    
    public isStateResist(stateId: DStateId): boolean {
        return this.stateResistSet().includes(stateId);
    }

    //--------------------------------------------------------------------------------
    // LAbility

    addAbility(abilityId: DAbilityId) {
        const index = this._abilities.findIndex(id => (REGame.world.ability(id)).abilityId() == abilityId);
        if (index >= 0) {
        }
        else {
            const ability = SAbilityFactory.newAbility(abilityId);
            ability.setParent(this);

            assert(ability.hasId());
            this._abilities.push(ability.id());
            ability.onAttached(this);
        }
    }

    removeAbility(abilityId: DAbilityId) {
        const index = this._abilities.findIndex(id => (REGame.world.ability(id)).abilityId() == abilityId);
        if (index >= 0) {
            REGame.world.ability(this._abilities[index]).onDetached(this);
            this._abilities.splice(index, 1);
        }
    }

    removeAllAbilities() {
        this.abilities().forEach(s => {
            s.onDetached(this);
        });
        this._abilities = [];
    }

    public abilities(): readonly LAbility[] {
        return this._abilities.map(id => REGame.world.object(id) as LAbility);
    }




    /**
     * Entity が存在している場所から除外する。
     * 
     * 何らかの Inventory に入っているならそこから、Map 上に出現しているならその Block から除外する。
     * 除外された UniqueEntity 以外の Entity は、そのターンの間にいずれかから参照を得ない場合 GC によって削除される。
     */
    /*
    callRemoveFromWhereabouts(cctx: SCommandContext): REResponse {
        const parent = this.parentEntity();
        if (parent) {
            const response = parent._callBehaviorIterationHelper((behavior: LBehavior) => {
                return behavior.onRemoveEntityFromWhereabouts(cctx, this);
            });
            assert(this.parentObjectId().index2() == 0);    // 何らか削除されているはず
            return response;
        }
        else if (this.floorId.hasAny()) {
            REGame.map._removeEntity(this);
            return REResponse.Succeeded;
        }
        else {
            throw new Error();
        }
    }
    */

    
    /** 
     * 動的に生成した Game_Event が参照する EventData.
     * 頻繁にアクセスされる可能性があるので Attribute ではなくこちらに持たせている。
     */
    //eventData(): IDataMapEvent | undefined {
    //    return this._eventData;
    //}

    /**
     * ゲーム全体にわたって絶対に破棄 (destroy) されることの無い Entity (UniqueEntity) であるかどうか
     * 
     * Player や (ダンジョンを抜けても状態を保持する)仲間などが該当する。
     * これらはダンジョン内で倒れてもマップから "除外" されるだけで "破棄" されることはない。
     * 
     * UniqueEntity のインベントリに入れられたアイテム等は UniqueEntity ではないので注意。
     */
    isUnique(): boolean {
        return REGame.system.uniqueActorUnits.findIndex(id => id.equals(this.entityId())) >= 0;
    }

    /**
     * フォーカスされている Entity であるか。
     * 
     * フォーカス=操作中と考えてよい。
     * メッセージ表示時に主語を省略するといった処理で参照する。
     */
    isFocused(): boolean {
        return REGame.camera.focusedEntityId().equals(this.entityId());
    }

    /**
     * Entity が機能を果たせる状態にあるか（破棄準備状態であるか）
     * 
     * HP0 となっても直ちに破棄準備状態となるわけではなく、例えば復活草の効果を受けて回復することがある。
     * その他、仮に不死の Entity がいる場合、HP が 0 になろうともマップにとどまる限りは true となるべき。
     * 
     * そのためこの値が false の場合は、Entity が完全に機能を停止して World から取り除かれようとしていることを示す。
     * 各種処理で、こういった Entity を存在しないものとして扱うためにこのフラグを確認する。
     */
    isAlive(): boolean {
        return !this.isDestroyed() || this.isDeathStateAffected();
    }

    /**
     * この Entity に直接アタッチされている Behavior を検索します。
     * State や Ability にアタッチされている Behavior は対象外です。
     */
    public findEntityBehavior<T extends LBehavior>(ctor: { new(...args: any[]): T }): T | undefined {
        for (let i = 0; i < this._basicBehaviors.length; i++) {
            const a = REGame.world.behavior(this._basicBehaviors[i]);
            if (a instanceof ctor) {
                return a as T;
            }
        }
        return undefined;
    }

    /**
     * この Entity に直接アタッチされている Behavior を取得します。
     * State や Ability にアタッチされている Behavior は対象外です。
     * 見つからない場合は例外が発生します。
     */
    public getEntityBehavior<T extends LBehavior>(ctor: { new(...args: any[]): T }): T {
        const b = this.findEntityBehavior<T>(ctor);
        if (!b) throw new Error();
        return b;
    }

    private _iterateBehaviors(func: (x: LBehavior) => boolean) {
        const states = this.states();
        for (let i = states.length - 1; i >= 0; i--) {
            const behabiors = states[i].stateBehabiors();
            for (let i2 = behabiors.length - 1; i2 >= 0; i2--) {
                if (!func(behabiors[i2])) {
                    return;
                }
            }
        }

        for (let i = this._basicBehaviors.length - 1; i >= 0; i--) {
            if (!func(REGame.world.behavior(this._basicBehaviors[i]))) {
                return;
            }
        }
    }

    queryProperty(propertyId: number): any {
        let result: any = undefined;
        this._iterateBehaviors(b => {
            result = b.onQueryProperty(propertyId);
            return result == undefined;
        });
        return result ?? RESystem.propertyData[propertyId].defaultValue;
    }

    /**
     * Visual としての Idle 状態での再生 Sequel.
     * 
     * 状態異常等で変わる。
     */
    public queryIdleSequelId(): DSequelId {
        let id: DSequelId | undefined = undefined;
        this.iterateBehaviorsReverse(b => {
            id = b.onQueryIdleSequelId();
            return !id;
        });
        return id ? id : REBasics.sequels.idle;
    }

    queryActions(): DActionId[] {
        let result: DActionId[] = [];
        
        for (let i = 0; i < this._basicBehaviors.length; i++) { // 前方から
            result = REGame.world.behavior(this._basicBehaviors[i]).onQueryActions(result);
        }
        return result;
    }

    queryReactions(): DActionId[] {
        // 既定では、すべての Entity は Item として Map に存在できる。
        // Item 扱いしたくないものは、Behavior 側でこれらの Action を取り除く。
        // FIXME: 既定では拾ったり投げたりできないほうがいいかも。階段とか罠とか、間違って操作してしまう。やっぱりすべてに共通なものをここに置きたい。
        let result: DActionId[] = this.data().reactions.map(x => x.actionId).concat(
        [
            //DBasics.actions.ExchangeActionId,
            REBasics.actions.ThrowActionId,
            REBasics.actions.FallActionId,
            REBasics.actions.DropActionId,
        ]);

        if (this.isOnGround()) {
            // Ground Layer 上に存在していれば、拾われる可能性がある
            result.push(REBasics.actions.PickActionId);
        }
        else {
            result.push(REBasics.actions.PutActionId);
        }


        //for (let i = 0; i < this._basicBehaviors.length; i++) {
            //result = REGame.world.behavior(this._basicBehaviors[i]).onQueryReactions(result);
        //}
        for (const b of this.collectBehaviors()) {
            b.onQueryReactions(result);
        }
        return result;
    }

    
    public collectTraits(): IDataTrait[] {
        const result: IDataTrait[] = [];
        for (const i of this.basicBehaviors()) {
            i.onCollectTraits(this, result);
        }
        for (const i of this.states()) {
            i.collectTraits(this, result);
        }
        return result;
    }

    public collectSkillActions(): IDataAction[] {
        const result: IDataAction[] = [];
        for (const i of this.collectBehaviors()) {
            i.onCollectSkillActions(result);
        }
        return result;
    }

    public queryIdealParameterPlus(paramId: DParameterId): number {
        return this.collectBehaviors().reduce((r, b) => r + b.onQueryIdealParameterPlus(paramId), 0);
    }

    /** @deprecated  use collectBehaviors*/
    _callBehaviorIterationHelper(func: (b: LBehavior) => SCommandResponse): SCommandResponse {
        const abilities = this.abilities();
        let response = SCommandResponse.Pass;
        for (let i = abilities.length - 1; i >= 0; i--) {
            for (const b of abilities[i].behabiors()) {
                let r = func(b);
                if (r != SCommandResponse.Pass) {
                    response = r;
                }
            }
        }
        for (let i = this._basicBehaviors.length - 1; i >= 0; i--) {
            let r = func(REGame.world.behavior((this._basicBehaviors[i])));
            if (r != SCommandResponse.Pass) {
                response = r;
            }
        }
        return response;
    }

    // TODO: State と通常の Behavior を分けるのやめる。
    // 今後印なども同じような実装となるが、型の違う Behavior を検索して呼び出すのが煩雑になりすぎる。
    /** @deprecated  use collectBehaviors*/
    _callStateIterationHelper(func: (x: LBehavior) => SCommandResponse): SCommandResponse {
        const states = this.states();
        let response = SCommandResponse.Pass;
        for (let i = states.length - 1; i >= 0; i--) {
            response = states[i]._callStateIterationHelper(func);
        }
        return response;
    }

    
    /** @deprecated  use collectBehaviors*/
    public static _iterateBehavior<TResult>(behaviorIds: readonly LBehaviorId[], func: (x: LBehavior) => TResult, isContinue: (x: TResult) => boolean): TResult | undefined {
        let result:(TResult | undefined) = undefined;
        for (let iBehavior = behaviorIds.length - 1; iBehavior >= 0; iBehavior--) {
            const behavior = REGame.world.behavior(behaviorIds[iBehavior]);
            result = func(behavior);
            if (!isContinue(result)) {
                return result;
            }
        }
        return result;
    }


    /*
    public static _iterationHelper_ProcessPhase<TObject extends LObject>(objects: readonly TObject[], func: (x: LBehavior) => SPhaseResult): SPhaseResult | undefined {
        for (let iObject = objects.length - 1; iObject >= 0; iObject--) {
            const r = LEntity._iterateBehavior<SPhaseResult>(objects[iObject].behaviorIds(), func, r => r == SPhaseResult.Pass);
            if (r) return r;
        }
        return SPhaseResult.Pass;
    }
    */

    /** @deprecated  use iterateBehaviors2*/
    public iterateBehaviors(func: (b: LBehavior) => void): void {
        for (const id of this._basicBehaviors) {
            func(REGame.world.behavior(id));
        }
    }

    public iterateStates(func: (s: LState) => boolean): void {
        for (const id of this._states) {
            if (!func(REGame.world.object(id) as LState)) return;
        }
    }

    public iterateBehaviors2(func: (b: LBehavior) => boolean): boolean {
        const sealedSpecialAbility = this.traits(REBasics.traits.SealSpecialAbility).length > 0;
        for (let i = 0; i < this._basicBehaviors.length; i++) {
            const j = REGame.world.behavior(this._basicBehaviors[i]) ;
            if (sealedSpecialAbility && j.behaviorGroup() == LBehaviorGroup.SpecialAbility) continue;
            if (!func(j)) return false;
        }

        for (let i = 0; i < this._states.length; i++) {
            const j = REGame.world.object(this._states[i]) as LState;
            if (!j.iterateBehaviors(b => func(b))) return false;
        }

        for (let i = 0; i < this._abilities.length; i++) {
            const j = REGame.world.object(this._abilities[i]) as LAbility;
            if (!j.iterateBehaviors(b => func(b))) return false;
        }

        return true;
    }

    public iterateBehaviorsReverse(func: (b: LBehavior) => boolean): boolean {
        for (let i = this._states.length - 1; i >= 0; i--) {
            const j = REGame.world.object(this._states[i]) as LState;
            if (!j.iterateBehaviors(b => func(b))) return false;
        }

        for (let i = this._abilities.length - 1; i >= 0; i--) {
            const j = REGame.world.object(this._abilities[i]) as LAbility;
            if (!j.iterateBehaviors(b => func(b))) return false;
        }

        const sealedSpecialAbility = this.traits(REBasics.traits.SealSpecialAbility).length > 0;
        for (let i = this._basicBehaviors.length - 1; i >= 0; i--) {
            const j = REGame.world.behavior(this._basicBehaviors[i]) ;
            if (sealedSpecialAbility && j.behaviorGroup() == LBehaviorGroup.SpecialAbility) continue;
            if (!func(j)) return false;
        }

        return true;
    }

    /** @deprecated iterateBehaviorsReverse */
    public collectBehaviors(): LBehavior[] {
        const result: LBehavior[] = [];
        this.iterateBehaviors2(b => {
            result.push(b);
            return true;
        });
        return result;
    }

    _callDecisionPhase(cctx: SCommandContext, phase: DecisionPhase): SPhaseResult {
        let result = SPhaseResult.Pass;
        this.iterateBehaviorsReverse(b => {
            result = b.onDecisionPhase(this, cctx, phase);
            return result == SPhaseResult.Pass;
        });
        return result;
    }

    _sendActivity(cctx: SCommandContext, actx: SActivityContext): SCommandResponse {
        let result = SCommandResponse.Pass;
        
        this.iterateBehaviorsReverse(b => {
            result = b.onPreActivity(this, cctx, actx);
            return result == SCommandResponse.Pass;
        });
        if (result != SCommandResponse.Pass) return result;

        this.iterateBehaviorsReverse(b => {
            result = b.onActivity(this, cctx, actx);
            return result == SCommandResponse.Pass;
        });
        return result;
    }

    _sendActivityReaction(cctx: SCommandContext, activity: LActivity): SCommandResponse {
        return this._callBehaviorIterationHelper(x => x.onActivityReaction(this, cctx, activity));
    }
    

    makeSaveContents(): any {
        let contents: any = {};
        contents.id = this.entityId();
        contents.floorId = this.floorId;
        contents.x = this.x;
        contents.y = this.y;
        contents.behaviors = this._basicBehaviors;
        return contents;
    }

    extractSaveContents(contents: any) {
        this._setObjectId(contents.id);
        this.floorId = contents.floorId;
        this.x = contents.x;
        this.y = contents.y;

        this._basicBehaviors = contents.behaviors;
    }

    

    //--------------------------------------------------------------------------------
    // Map Utils

    /**
     * この Entity が GroundLayer 上に存在しているかを確認する。
     * Map 上に出現していても、Ground 以外のレイヤーに存在している場合は false を返す。
     */
    isOnGround(): boolean {
        if (this.floorId.hasAny()) {
            const block = REGame.map.block(this.x, this.y);
            return block.findEntityLayerKind(this) == DBlockLayerKind.Ground;
        }
        else {
            return false;
        }
    }

    //isTile(): boolean {
    //    return this.findAttribute(RETileAttribute) != undefined;
    //}

    /** 0 is Invalid. */
    public roomId(): LRoomId {
        return REGame.map.block(this.x, this.y)._roomId;
    }

    public isOnRoom(): boolean {
        return this.roomId() > 0;
    }

    public isOnPassageWay(): boolean {
        return this.roomId() <= 0;
    }

    public layer(): DBlockLayerKind {
        const r = REGame.map.block(this.x, this.y).findEntityLayerKind(this);
        assert(r);
        return r;
    }

    /** 特定の座標を持っておらず、Floor へ進入中であるかどうか。Map がロードされた後、EntryPoint へ配置される状態。 */
    public isEnteringToFloor(): boolean {
        return this.x < 0;
    }

    /** 現在のマップ上に出現しているか (いずれかの Block 上に存在しているか) */
    public isAppearedOnMap(): boolean {
        if (!REGame.map.isValidPosition(this.x, this.y)) return false;
        const block = REGame.map.block(this.x, this.y);
        return block.containsEntity(this);
    }

    //----------------------------------------
    
    _dropItemGenerated = false;

    public generateDropItems(cause: LGenerateDropItemCause): LEntity[] {
        const result: LEntity[] = [];
        this.iterateBehaviorsReverse(b => {
            b.onGenerateDropItems(this, cause, result);
            return true;
        });
        return result;
    }

    //----------------------------------------

    // true を返したら効果適用可能
    public previewRejection(cctx: SCommandContext, rejection: SRejectionInfo): boolean {
        let result: any = SCommandResponse.Pass;
        this.iterateBehaviorsReverse(b => {
            result = b.onPreviewRejection(this, cctx, rejection);
            return result == SCommandResponse.Pass;
        });
        return result != SCommandResponse.Canceled;
    }

    // // true を返したら効果適用可能
    // public previewEffectBehaviorRejection(cctx: SCommandContext, effect: DEffect): boolean {
    //     let result: any = SCommandResponse.Pass;
    //     this.iterateBehaviorsReverse(b => {
    //         result = b.onPreviewEffectRejection(cctx, this, effect);
    //         return result == SCommandResponse.Pass;
    //     });
    //     return result != SCommandResponse.Canceled;
    // }

    // // true を返したら効果適用可能
    // public previewEffectBehaviorReaction(cctx: SCommandContext, id: DEffectBehaviorId): boolean {
    //     let result: any = SCommandResponse.Pass;
    //     this.iterateBehaviorsReverse(b => {
    //         result = b.onPreviewEffectBehaviorRejection(cctx, this, id);
    //         return result == SCommandResponse.Pass;
    //     });
    //     return result != SCommandResponse.Canceled;
    // }
    
    //----------------------------------------

    _shopArticle: LShopArticle = new LShopArticle();


    
    //----------------------------------------
    // 未分類。何かしらシステム化したほうがよさそうなもの

    public sendPartyEvent(eventId: DEventId, args: any): boolean {
        if (this._partyId > 0) {
            return REGame.world.party(this._partyId).send(eventId, args);
        }
        return true;
    }

    public checkLooksLikeItem(): boolean {
        for (const b of this.collectBehaviors().reverse()) {
            const v = b.onCheckLooksLikeItem();
            if (v) return v;
        }
        return false;
    }

    public checkLooksLikeGold(): boolean {
        for (const b of this.collectBehaviors().reverse()) {
            const v = b.onCheckLooksLikeGold();
            if (v) return v;
        }
        return false;
    }
    

    //----------------------------------------
    // Stack support

    _stackCount: number = 1;

    public canStack(): boolean {
        return !!this.collectTraits().find(x => x.code == REBasics.traits.Stackable);
    }

    public checkStackable(other: LEntity): boolean {
        if (!this.collectTraits().find(x => x.code == REBasics.traits.Stackable)) return false;
        if (!other.collectTraits().find(x => x.code == REBasics.traits.Stackable)) return false;

        // TODO: 今は矢だけなのでこれでよいが、アタッチされているAbilityなども見るべき
        return this.dataId() == other.dataId();
    }

    public isStacked(): boolean {
        assert(this._stackCount >= 1);
        return this._stackCount >= 2;
    }

    /**
     * 指定 Entity をスタックに入れ、削除する。
     */
    public increaseStack(other: LEntity): void {
        assert(this.checkStackable(other));
        this._stackCount = Math.min(this._stackCount + other._stackCount, 99);
        other.destroy();
    }

    /**
     * スタックを減らして新しい Entity を作成する。
     */
    public decreaseStack(): LEntity {
        assert(this._stackCount >= 2);
        this._stackCount--;
        const newEntity = this.clone();
        newEntity._stackCount = 1;
        return newEntity;
    }

    
    //----------------------------------------
    // Debug Utils

    public debugDisplayName(): string {
        return `Entity:${this._name}(${this.entityId().index2()}:${this.entityId().key2()})`;
    }

    //----------------------------------------
    // Fomula properties

    public get hp(): number {
        return this.actualParam(REBasics.params.hp);
    }
    public get atk(): number {
        return this.actualParam(REBasics.params.atk);
    }
    public get def(): number {
        return this.actualParam(REBasics.params.def);
    }
    public get agi(): number {
        return this.actualParam(REBasics.params.agi);
    }
    public get fp(): number {
        return this.actualParam(REBasics.params.fp);
    }
}

