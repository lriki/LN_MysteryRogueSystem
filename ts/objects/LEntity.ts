import { LAttribute } from "./attributes/LAttribute";
import { DecisionPhase, LBehavior, LBehaviorId } from "./behaviors/LBehavior";
import { REGame } from "./REGame";
import { RECommand, REResponse } from "../system/RECommand";
import { RECommandContext } from "../system/RECommandContext";
import { BlockLayerKind, LRoomId, REGame_Block } from "./REGame_Block";
import { RESystem } from "ts/system/RESystem";
import { DState, DStateId } from "ts/data/DState";
import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DEntityKindId } from "ts/data/DEntityKind";
import { eqaulsEntityId, LEntityId, LObject, LObjectType } from "./LObject";
import { REGame_Map } from "./REGame_Map";
import { TilingSprite } from "pixi.js";
import { LState, LStateId } from "./states/LState";
import { LWorld } from "./LWorld";
import { LEffectResult } from "ts/objects/LEffectResult";
import { DActionId } from "ts/data/DAction";
import { DParameterId, REData } from "ts/data/REData";
import { LAbility } from "./abilities/LAbility";
import { DAbilityId } from "ts/data/DAbility";
import { FlowFlags } from "typescript";
import { LRoom } from "./LRoom";

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
 */
export class LEntity extends LObject
{
    

    attrbutes: LAttribute[] = [];

    private _basicBehaviors: LBehaviorId[] = [];    // Entity 生成時にセットされる基本 Behavior. Entity 破棄まで変更されることは無い。
    
    private _parentIsMap = false;

    public constructor() {
        super(LObjectType.Entity);
    }

    //----------------------------------------
    // Object Reference Management
    
    public entityId(): LEntityId {
        //return this._id;
        return this.__objectId();
    }

    public hasOwner(): boolean {
        return super.hasOwner() || this._parentIsMap;
    }

    public ownerIsMap(): boolean {
        return this._parentIsMap;
    }

    public setOwner(owner: LEntity): void {
        assert(!this._parentIsMap);
        super.setOwner(owner);
    }

    public setOwnerMap(owner: REGame_Map): void {
        assert(this.ownerObjectId().index == 0);
        assert(!this.hasOwner());
        this._parentIsMap = true;
    }

    public clearOwner(): void {
        super.clearOwner();
        this._parentIsMap = false;
    }



    


    _name: string = ""; // 主にデバッグ用

    // HC3 で作ってた CommonAttribute はこっちに持ってきた。
    // これらは Entity ごとに一意であるべきで、Framework が必要としている必須パラメータ。
    // Attribute よりはこっちに置いた方がいいだろう。
    _displayName: string = '';
    _iconName: string = '';
    //_blockLayer: BlockLayer = BlockLayer.Unit;

    prefabKey: string | undefined = undefined;//{ kind: DEntityKindId, id: number } = { kind: 0, id: 0 };
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
    floorId: number = 0;
    x: number = 0;          /**< 論理 X 座標 */
    y: number = 0;          /**< 論理 Y 座標 */

    //--------------------
    // 以下、一時的に Entity に直接持たせてる Attr. 利用率とかで、別途 Attr クラスに分けたりする。

    dir: number = 4;        // Numpad Dir

    // Block を占有するかどうか
    blockOccupied: boolean = true;

    // 隣接移動直後の DialogOpend かどうか。
    // 階段などの Entity に対しては足元コマンドを自動表示したりする。
    // ユーザビリティのためだけに参照する点に注意。セーブデータをロードした直後はウィンドウを表示したりしたくないので、セーブデータに含まれる。
    immediatelyAfterAdjacentMoving: boolean = false;
    
    // Unit の状態異常のほか、アイテムの呪い、祝福、封印などでも使用する。
    // とりあえず Entity に持たせて様子見。
    _states: LStateId[] = [];
    
    _abilities: LAbility[] = [];

    // EffectResult はコアスクリプトの ActionResult 同様、System ではなく Entity 側に持たせてみる。
    // EffectContext に持たせて持ちまわってもよいのだが、ステート変更やパラメータ増減など様々なタイミングで参照されるため
    // それらすべての関数で EffectContext を持ちまわるのはかなり煩雑なコードになってしまう。
    _effectResult: LEffectResult = new LEffectResult();

    _actionConsumed: boolean = false;

    _located: boolean = false;

    onFinalize(): void {
        // 現在マップ上の Entity 削除
        if (this.floorId == REGame.map.floorId()) {
            REGame.map._removeEntity(this);
        }
        REGame.scheduler.invalidateEntity(this);



        this.basicBehaviors().forEach(b => {
            b.onDetached();
            REGame.world._unregisterBehavior(b);
        });
        this._basicBehaviors = [];
        this.removeAllStates();


    }

    parentEntity(): LEntity | undefined {
        if (this.ownerObjectId().index > 0) {
            return REGame.world.entity(this.ownerObjectId());
        }
        else {
            return undefined;
        }
    }

    addAttribute(value: LAttribute) {
        assert(value._ownerEntityId.index == 0);
        this.attrbutes.push(value);
        value._ownerEntityId = this.entityId();
        return this;
    }

    //----------------------------------------
    // Behavior

    basicBehaviors(): LBehavior[] {
        return this._basicBehaviors.map(x => REGame.world.behavior(x));
    }

    
    public addBehavior<T extends LBehavior>(ctor: { new(...args: any[]): T }, ...args: any[]): T {
        const behavior = new ctor(args);
        REGame.world._registerBehavior(behavior);
        this._addBehavior(behavior);
        return behavior;
    }

    _addBehavior(behavior: LBehavior) {
        assert(behavior.hasId());
        assert(this.entityId().index > 0);
        this._basicBehaviors.push(behavior.id());
        behavior.setOwner(this);
        behavior.onAttached();
        return behavior;
    }

    /*
    addBasicBehavior(behavior: LBehavior) {
        assert(behavior.hasId());
        assert(this.entityId().index > 0);

        this._basicBehaviors.push(behavior.id());
        behavior.setOwner(this);
        behavior.onAttached();
    }
    */
    

    //addAdhocBehavior(value: REGame_Behavior) {
    //    this._adhocBehaviors.unshift(value);
    //}

    //addBehavior(value: LBehavior) {
    //    this._basicBehaviors.unshift(value);
    //}

    removeBehavior(behavior: LBehavior) {
        const index = this._basicBehaviors.findIndex(x => eqaulsEntityId(x, behavior.id()));
        if (index >= 0) {
            this._basicBehaviors.splice(index, 1);
            behavior.onDetached();
            REGame.world._unregisterBehavior(behavior);
        }
    }

    //--------------------------------------------------------------------------------
    // State

    addState(stateId: DStateId) {
        const states = this.states();
        const index = states.findIndex(s => s.stateId() == stateId);
        if (index >= 0) {
            states[index].recast();
        }
        else {
            const state = new LState(stateId);
            state.setOwner(this);
            
            assert(state.hasId());
            this._states.push(state.id());
            state.onAttached();
            this._effectResult.pushAddedState(stateId);
        }
    }

    removeState(stateId: DStateId) {
        const states = this.states();
        const index = states.findIndex(s => s.stateId() == stateId);
        if (index >= 0) {
            states[index].onDetached();
            this._states.splice(index, 1);
            this._effectResult.pushRemovedState(stateId);
        }
    }

    removeAllStates() {
        this.states().forEach(s => {
            s.onDetached();
        });
        this._states = [];
    }

    public states(): readonly LState[] {
        return this._states.map(id => REGame.world.object(id) as LState);
    }
    
    public isStateAffected(stateId: DStateId): boolean {
        return this.states().findIndex(s => s.stateId() == stateId) >= 0;
    }

    //--------------------------------------------------------------------------------
    // LAbility

    addAbility(abilityId: DAbilityId) {
        const index = this._abilities.findIndex(s => s.abilityId() == abilityId);
        if (index >= 0) {
        }
        else {
            const state = new LAbility();
            state.setup(abilityId, this);
            this._abilities.push(state);
            state.onAttached();
        }
    }

    removeAbility(abilityId: DAbilityId) {
        const index = this._abilities.findIndex(s => s.abilityId() == abilityId);
        if (index >= 0) {
            this._abilities[index].onDetached();
            this._abilities.splice(index, 1);
        }
    }

    removeAllAbilities() {
        this._abilities.forEach(s => {
            s.onDetached();
        });
        this._abilities = [];
    }

    public abilities(): readonly LAbility[] {
        return this._abilities;
    }




    /**
     * Entity が存在している場所から除外する。
     * 
     * 何らかの Inventory に入っているならそこから、Map 上に出現しているならその Block から除外する。
     * 除外された UniqueEntity 以外の Entity は、そのターンの間にいずれかから参照を得ない場合 GC によって削除される。
     */
    callRemoveFromWhereabouts(context: RECommandContext): REResponse {
        const parent = this.parentEntity();
        if (parent) {
            const response = parent._callBehaviorIterationHelper((behavior: LBehavior) => {
                return behavior.onRemoveEntityFromWhereabouts(context, this);
            });
            assert(this.ownerObjectId().index == 0);    // 何らか削除されているはず
            return response;
        }
        else if (this.floorId > 0) {
            REGame.map._removeEntity(this);
            return REResponse.Succeeded;
        }
        else {
            throw new Error();
        }
    }

    
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
        return REGame.uniqueActorUnits.includes(this);
    }

    /**
     * フォーカスされている Entity であるか。
     * 
     * フォーカス=操作中と考えてよい。
     * メッセージ表示時に主語を省略するといった処理で参照する。
     */
    isFocused(): boolean {
        return eqaulsEntityId(REGame.camera.focusedEntityId(), this.entityId());
    }

    /**
     * Entity が機能を果たせる状態にあるか（破棄準備状態であるか）
     * 
     * HP0 となっても直ちに破棄準備状態となるわけではなく、例えば復活草の効果を受けて回復することがある。
     * その他、仮に不死の Entity がいる場合、HP が 0 になろうともマップにとどまる限りは false となるべき。
     * 
     * そのためこの値が true の場合は、Entity が完全に機能を停止して World から取り除かれようとしていることを示す。
     * 各種処理で、こういった Entity を存在しないものとして扱うためにこのフラグを確認する。
     */
    isAlive(): boolean {
        return !this.isDestroyed();
    }


    findAttribute<T>(ctor: { new(...args: any[]): T }): T | undefined {
        for (let i = 0; i < this.attrbutes.length; i++) {
            const a = this.attrbutes[i];
            if (a instanceof ctor) {
                return a as T;
            }
        }
        return undefined;
    }
    
    findBehavior<T extends LBehavior>(ctor: { new(...args: any[]): T }): T | undefined {
        for (let i = 0; i < this._basicBehaviors.length; i++) {
            const a = REGame.world.behavior(this._basicBehaviors[i]);
            if (a instanceof ctor) {
                return a as T;
            }
        }
        return undefined;
    }

    getBehavior<T extends LBehavior>(ctor: { new(...args: any[]): T }): T {
        const b = this.findBehavior<T>(ctor);
        if (!b) throw new Error();
        return b;
    }

    hasBehavior<T extends LBehavior>(ctor: { new(...args: any[]): T }): boolean {
        return this.findBehavior<T>(ctor) != undefined;
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
        let result: DActionId[] = [
            //DBasics.actions.ExchangeActionId,
            DBasics.actions.ThrowActionId,
            DBasics.actions.FallActionId,
            DBasics.actions.DropActionId,
        ];

        if (this.isOnGround()) {
            // Ground Layer 上に存在していれば、拾われる可能性がある
            result.push(DBasics.actions.PickActionId);
        }
        else {
            result.push(DBasics.actions.PutActionId);
        }


        for (let i = 0; i < this._basicBehaviors.length; i++) {
            result = REGame.world.behavior(this._basicBehaviors[i]).onQueryReactions(result);
        }
        return result;
    }

    
    public collectTraits(): IDataTrait[] {
        const result: IDataTrait[] = [];
        for (const b of this.basicBehaviors()) {
            b.onCollectTraits(result);
        }
        return result;
    }

    public queryIdealParameterPlus(parameterId: DParameterId): number {
        return this.basicBehaviors().reduce((r, b) => r + b.onQueryIdealParameterPlus(parameterId), 0);
    }

    public refreshStatus(): void {
        this.basicBehaviors().forEach(b => b.onRefreshStatus());
    }

    _callBehaviorIterationHelper(func: (b: LBehavior) => REResponse): REResponse {
        let response = REResponse.Pass;
        for (let i = this._abilities.length - 1; i >= 0; i--) {
            for (const b of this._abilities[i].behabiors()) {
                let r = func(b);
                if (r != REResponse.Pass) {
                    response = r;
                }
            }
        }
        for (let i = this._basicBehaviors.length - 1; i >= 0; i--) {
            let r = func(REGame.world.behavior((this._basicBehaviors[i])));
            if (r != REResponse.Pass) {
                response = r;
            }
        }
        return response;
    }

    // TODO: State と通常の Behavior を分けるのやめる。
    // 今後印なども同じような実装となるが、型の違う Behavior を検索して呼び出すのが煩雑になりすぎる。
    _callStateIterationHelper(func: (x: LBehavior) => REResponse): REResponse {
        const states = this.states();
        let response = REResponse.Pass;
        for (let i = states.length - 1; i >= 0; i--) {
            response = states[i]._callStateIterationHelper(func);
        }
        return response;
    }

    _callDecisionPhase(context: RECommandContext, phase: DecisionPhase): REResponse {
        let r = this._callStateIterationHelper(x => x.onDecisionPhase(this, context, phase));
        if (r != REResponse.Pass) return r;
        return this._callBehaviorIterationHelper(x => x.onDecisionPhase(this, context, phase));
    }

    _sendPreAction(context: RECommandContext, cmd: RECommand): REResponse {
        return this._callBehaviorIterationHelper(x => x.onPreAction(this, context, cmd));
    }

    _sendPreRection(context: RECommandContext, cmd: RECommand): REResponse {
        return this._callBehaviorIterationHelper(x => x.onPreReaction(this, context, cmd));
    }

    _sendAction(context: RECommandContext, cmd: RECommand): REResponse {
        return this._callBehaviorIterationHelper(x => x.onAction(this, context, cmd));
    }

    _sendReaction(context: RECommandContext, actor: LEntity, cmd: RECommand): REResponse {
        return this._callBehaviorIterationHelper(x => x.onReaction(this, actor, context, cmd));
    }

    makeSaveContents(): any {
        let contents: any = {};
        contents.id = this.entityId();
        contents.floorId = this.floorId;
        contents.x = this.x;
        contents.y = this.y;
        contents.attrbutes = this.attrbutes;
        contents.behaviors = this._basicBehaviors;
        return contents;
    }

    extractSaveContents(contents: any) {
        this._setObjectId(contents.id);
        this.floorId = contents.floorId;
        this.x = contents.x;
        this.y = contents.y;
        this.attrbutes = contents.attrbutes.map((x: any) => {
            const i = RESystem.createAttribute(x.dataId);
            Object.assign(i, x);
            return i;
        });
        this._basicBehaviors = contents.behaviors;
    }

    

    //--------------------------------------------------------------------------------
    // Map Utils

    /**
     * この Entity が GroundLayer 上に存在しているかを確認する。
     * Map 上に出現していても、Ground 以外のレイヤーに存在している場合は false を返す。
     */
    isOnGround(): boolean {
        if (this.floorId > 0) {
            const block = REGame.map.block(this.x, this.y);
            return block.findEntityLayerKind(this) == BlockLayerKind.Ground;
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
}

