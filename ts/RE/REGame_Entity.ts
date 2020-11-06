import { REGame_Attribute } from "./REGame_Attribute";
import { DecisionPhase, REGame_Behavior } from "./REGame_Behavior";
import { REGame } from "./REGame";
import { RECommand, REResponse } from "../system/RECommand";
import { RECommandContext } from "../system/RECommandContext";
import { BlockLayerKind } from "./REGame_Block";
import { RESystem } from "ts/system/RESystem";
import { ActionId } from "ts/data/REData";
import { LState } from "ts/objects/State";

export type EntityId = number;

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
 */
export class REGame_Entity
{

    attrbutes: REGame_Attribute[] = [];
    private _basicBehaviors: REGame_Behavior[] = [];    // Entity 生成時にセットされる基本 Behavior. Entity 破棄まで変更されることは無い。
    //private _adhocBehaviors: REGame_Behavior[] = [];    // 実行中にセットされる Behavior. 状態異常などで、基本とは異なる振る舞いをするときにセットされる。

    private _states: LState[] = [];

    _id: number = 0;
    _name: string = ""; // 主にデバッグ用
    _destroyed: boolean = false;

    // HC3 で作ってた CommonAttribute はこっちに持ってきた。
    // これらは Entity ごとに一意であるべきで、Framework が必要としている必須パラメータ。
    // Attribute よりはこっちに置いた方がいいだろう。
    _displayName: string = '';
    _iconName: string = '';
    _blockLayer: BlockLayer = BlockLayer.Unit;

    prefabKey: { kind: number, id: number } = { kind: 0, id: 0 };
    rmmzEventId: number = 0;

    // HC3 までは PositionalAttribute に持たせていたが、こっちに持ってきた。
    // お店のセキュリティシステムなど、これらを使わない Entity もあるのだが、
    // ほとんどの Entity が持つことになるパラメータなので、Attribute にするとコードが複雑になりすぎる。
    floorId: number = 0;    /**< Entity が存在しているフロア。0 は無効値 & 異常値。直接変更禁止。transfarMap を使うこと */
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
    

    //static newEntity(): REGame_Entity {
    //    const e = new REGame_Entity();
    //    REGame.world._addEntity(e);
    //    return e;
    //}

    id(): number {
        return this._id;
    }

    addAttribute(value: REGame_Attribute) {
        this.attrbutes.push(value);
        return this;
    }

    basicBehaviors(): REGame_Behavior[] {
        return this._basicBehaviors;
    }

    addBasicBehavior(value: REGame_Behavior) {
        this._basicBehaviors.unshift(value);
    }

    //addAdhocBehavior(value: REGame_Behavior) {
    //    this._adhocBehaviors.unshift(value);
    //}

    addBehavior(value: REGame_Behavior) {
        this._basicBehaviors.unshift(value);
    }

    removeBehavior(value: REGame_Behavior) {
        const index = this._basicBehaviors.findIndex(x => x == value);
        if (index >= 0) this._basicBehaviors.splice(index, 1);
    }

    addState(value: LState) {
        this._states.unshift(value);
    }

    removeState(value: LState) {
        const index = this._states.findIndex(x => x == value);
        if (index >= 0) this._states.splice(index, 1);
    }

    
    /** 
     * 動的に生成した Game_Event が参照する EventData.
     * 頻繁にアクセスされる可能性があるので Attribute ではなくこちらに持たせている。
     */
    //eventData(): IDataMapEvent | undefined {
    //    return this._eventData;
    //}

    isDestroyed(): boolean {
        return this._destroyed;
    }

    destroy(): void {
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
        /*
        const r = this.attrbutes.find(x => x.constructor.toString() === Text.name);
        if (r)
            return r as unknown as T;
        else
            return undefined;
            */
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
        let result: ActionId[] = [];    // TODO: あとで flatMap() 使うようにしたい
        for (let i = 0; i < this._basicBehaviors.length; i++) {
            result = result.concat(this._basicBehaviors[i].onQueryActions());
        }
        return result;
    }

    _callBehaviorIterationHelper(func: (b: REGame_Behavior) => REResponse): REResponse {
        for (let i = 0; i < this._basicBehaviors.length; i++) {
            const r = func(this._basicBehaviors[i]);//this._behaviors[i].onPreAction(cmd);
            if (r != REResponse.Pass) {
                return r;
            }
        }
        return REResponse.Pass;
    }

    _callStateIterationHelper(func: (x: LState) => REResponse): REResponse {
        for (let i = 0; i < this._states.length; i++) {
            const r = func(this._states[i]);
            if (r != REResponse.Pass) {
                return r;
            }
        }
        return REResponse.Pass;
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

    constructor() {

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

