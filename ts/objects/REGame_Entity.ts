import { LAttribute } from "../objects/attributes/LAttribute";
import { DecisionPhase, LBehavior } from "../objects/behaviors/LBehavior";
import { REGame } from "./REGame";
import { RECommand, REResponse } from "../system/RECommand";
import { RECommandContext } from "../system/RECommandContext";
import { BlockLayerKind, REGame_Block } from "./REGame_Block";
import { RESystem } from "ts/system/RESystem";
import { ActionId } from "ts/data/REData";
import { LStateBehavior } from "ts/objects/states/LStateBehavior";
import { DState, DStateId } from "ts/data/DState";
import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DEntityKindId } from "ts/data/DEntityKind";
import { RETileAttribute } from "./attributes/RETileAttribute";
import { eqaulsEntityId, LEntityId } from "./LObject";
import { REGame_Map } from "./REGame_Map";
import { TilingSprite } from "pixi.js";
import { LState } from "./states/LState";

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
export class REGame_Entity
{
    
    private _id: LEntityId = { index: 0, key: 0 };
    
    /**
     * 親 Entity。
     * 例えば Inventory に入っている Entity は、その Inventory を持つ Entity を親として参照する。
     * 
     * GC のタイミングで、parent がおらず、UniqueEntity や Map に出現している Entity のリストに存在しない Entity は削除される。
     */
    private _parentEntityId: LEntityId = { index: 0, key: 0 };
    private _parentIsMap = false;

    public id(): LEntityId {
        return this._id;
    }

    public _setId(id: LEntityId): void  {
        assert(id.index > 0);
        this._id = id;
    }

    public parentid(): LEntityId {
        return this._parentEntityId;
    }

    public hasParent(): boolean {
        return this._parentEntityId.index > 0 || this._parentIsMap;
    }

    public parentIsMap(): boolean {
        return this._parentIsMap;
    }

    public setParent(parent: REGame_Entity): void {
        assert(!this._parentIsMap);
        assert(!this.hasParent());

        const parentId = parent.id();
        assert(parentId.index > 0);     // ID を持たない親は設定できない
        this._parentEntityId = parentId;
    }

    public setParentMap(parent: REGame_Map): void {
        assert(this._parentEntityId.index == 0);
        assert(!this.hasParent());
        this._parentIsMap = true;
    }

    public clearParent(): void {
        this._parentEntityId = { index: 0, key: 0 };
        this._parentIsMap = false;
    }



    

    attrbutes: LAttribute[] = [];
    private _basicBehaviors: LBehavior[] = [];    // Entity 生成時にセットされる基本 Behavior. Entity 破棄まで変更されることは無い。
    //private _adhocBehaviors: REGame_Behavior[] = [];    // 実行中にセットされる Behavior. 状態異常などで、基本とは異なる振る舞いをするときにセットされる。


    _name: string = ""; // 主にデバッグ用
    _destroyed: boolean = false;

    // HC3 で作ってた CommonAttribute はこっちに持ってきた。
    // これらは Entity ごとに一意であるべきで、Framework が必要としている必須パラメータ。
    // Attribute よりはこっちに置いた方がいいだろう。
    _displayName: string = '';
    _iconName: string = '';
    //_blockLayer: BlockLayer = BlockLayer.Unit;

    prefabKey: { kind: DEntityKindId, id: number } = { kind: 0, id: 0 };
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
    _states: LState[] = [];

    _actionConsumed: boolean = false;

    parentEntity(): REGame_Entity | undefined {
        if (this._parentEntityId.index > 0) {
            return REGame.world.entity(this._parentEntityId);
        }
        else {
            return undefined;
        }
    }

    addAttribute(value: LAttribute) {
        assert(value._ownerEntityId.index == 0);
        this.attrbutes.push(value);
        value._ownerEntityId = this._id;
        return this;
    }

    basicBehaviors(): LBehavior[] {
        return this._basicBehaviors;
    }

    addBasicBehavior(value: LBehavior) {
        assert(this._id.index > 0);
        this._basicBehaviors.push(value);
        value._ownerEntityId = this._id;
    }

    //addAdhocBehavior(value: REGame_Behavior) {
    //    this._adhocBehaviors.unshift(value);
    //}

    //addBehavior(value: LBehavior) {
    //    this._basicBehaviors.unshift(value);
    //}

    removeBehavior(value: LBehavior) {
        const index = this._basicBehaviors.findIndex(x => x == value);
        if (index >= 0) this._basicBehaviors.splice(index, 1);
    }

    addState(stateId: DStateId) {
        const index = this._states.findIndex(s => s.stateId() == stateId);
        if (index >= 0) {
            this._states[index].recast();
        }
        else {
            this._states.push(new LState(stateId));
        }
    }

    removeState(stateId: DStateId) {
        const index = this._states.findIndex(s => s.stateId() == stateId);
        if (index >= 0) {
            this._states.splice(index, 1);
        }
    }
    
    public isStateAffected(stateId: DStateId): boolean {
        return this._states.findIndex(s => s.stateId() == stateId) >= 0;
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
            assert(this._parentEntityId.index == 0);    // 何らか削除されているはず
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
        return eqaulsEntityId(REGame.camera.focusedEntityId(), this._id);
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
        return !this._destroyed;
    }

    /** isAlive() の逆 */
    isDestroyed(): boolean {
        return this._destroyed;
    }

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

    isTile(): boolean {
        return this.findAttribute(RETileAttribute) != undefined;
    }

    destroy(): void {
        assert(!this.isUnique());
        this._destroyed = true;
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
    
    findBehavior<T>(ctor: { new(...args: any[]): T }): T | undefined {
        for (let i = 0; i < this._basicBehaviors.length; i++) {
            const a = this._basicBehaviors[i];
            if (a instanceof ctor) {
                return a as T;
            }
        }
        return undefined;
    }

    getBehavior<T>(ctor: { new(...args: any[]): T }): T {
        const b = this.findBehavior<T>(ctor);
        if (!b) throw new Error();
        return b;
    }

    queryProperty(propertyId: number): any {
        for (let i = 0; i < this._basicBehaviors.length; i++) {
            const value = this._basicBehaviors[i].onQueryProperty(propertyId);
            if (value !== undefined) {
                return value;
            }
        }
        return RESystem.propertyData[propertyId].defaultValue;
    }

    queryActions(): ActionId[] {
        let result: ActionId[] = [];
        
        for (let i = 0; i < this._basicBehaviors.length; i++) { // 前方から
            result = this._basicBehaviors[i].onQueryActions(result);
        }
        return result;
    }

    queryReactions(): ActionId[] {
        // 既定では、すべての Entity は Item として Map に存在できる。
        // Item 扱いしたくないものは、Behavior 側でこれらの Action を取り除く。
        let result: ActionId[] = [
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
            result = this._basicBehaviors[i].onQueryReactions(result);
        }
        return result;
    }

    _callBehaviorIterationHelper(func: (b: LBehavior) => REResponse): REResponse {
        let response = REResponse.Pass;
        for (let i = this._basicBehaviors.length - 1; i >= 0; i--) {
            let r = func(this._basicBehaviors[i]);
            if (r != REResponse.Pass) {
                response = r;
            }
        }
        return response;
    }

    // TODO: State と通常の Behavior を分けるのやめる。
    // 今後印なども同じような実装となるが、型の違う Behavior を検索して呼び出すのが煩雑になりすぎる。
    _callStateIterationHelper(func: (x: LStateBehavior) => REResponse): REResponse {
        let response = REResponse.Pass;
        for (let i = this._states.length - 1; i >= 0; i--) {
            response = this._states[i]._callStateIterationHelper(func);
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

    _sendReaction(context: RECommandContext, cmd: RECommand): REResponse {
        return this._callBehaviorIterationHelper(x => x.onReaction(this, context, cmd));
    }

    makeSaveContents(): any {
        let contents: any = {};
        contents.id = this._id;
        contents.floorId = this.floorId;
        contents.x = this.x;
        contents.y = this.y;
        contents.attrbutes = this.attrbutes;
        contents.behaviors = this._basicBehaviors.map(x => x.dataId);
        return contents;
    }

    extractSaveContents(contents: any) {
        this._id = contents.id;
        this.floorId = contents.floorId;
        this.x = contents.x;
        this.y = contents.y;
        this.attrbutes = contents.attrbutes.map((x: any) => {
            const i = RESystem.createAttribute(x.dataId);
            Object.assign(i, x);
            return i;
        });
        this._basicBehaviors = contents.behaviors.map((x: number) => {
            return RESystem.createBehavior(x);
        });
    }
}

