import { REGame_Attribute } from "./REGame_Attribute";
import { DecisionPhase, REGame_Behavior } from "./REGame_Behavior";
import { REGame } from "./REGame";
import { RECommand, REResponse } from "../system/RECommand";
import { RECommandContext } from "../system/RECommandContext";



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
    private _behaviors: REGame_Behavior[] = [];

    _id: number = 0;
    _name: string = ""; // 主にデバッグ用
    _destroyed: boolean = false;

    // HC3 で作ってた CommonAttribute はこっちに持ってきた。
    // これらは Entity ごとに一意であるべきで、Framework が必要としている必須パラメータ。
    // Attribute よりはこっちに置いた方がいいだろう。
    _displayName: string = '';
    _iconName: string = '';
    _blockLayer: BlockLayer = BlockLayer.Unit;

    // HC3 までは PositionalAttribute に持たせていたが、こっちに持ってきた。
    // お店のセキュリティシステムなど、これらを使わない Entity もあるのだが、
    // ほとんどの Entity が持つことになるパラメータなので、Attribute にするとコードが複雑になりすぎる。
    floorId: number = 0;    /**< Entity が存在しているフロア。0 は無効値 & 異常値。直接変更禁止。transfarMap を使うこと */
    x: number = 0;          /**< 論理 X 座標 */
    y: number = 0;          /**< 論理 Y 座標 */

    // 以下、一時的に Entity に直接持たせてる Attr. 利用率とかで、別途 Attr クラスに分けたりする。
    dir: number = 2;        // Numpad Dir


    _eventData: IDataMapEvent | undefined = undefined;

    //static newEntity(): REGame_Entity {
    //    const e = new REGame_Entity();
    //    REGame.world._addEntity(e);
    //    return e;
    //}

    id(): number {
        return this._id;
    }

    behaviors(): REGame_Behavior[] {
        return this._behaviors;
    }

    addBehavior(value: REGame_Behavior) {
        this._behaviors.push(value);
    }
    
    /** 
     * 動的に生成した Game_Event が参照する EventData.
     * 頻繁にアクセスされる可能性があるので Attribute ではなくこちらに持たせている。
     */
    eventData(): IDataMapEvent | undefined {
        return this._eventData;
    }

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

    _callBehaviorIterationHelper(func: (b: REGame_Behavior) => REResponse): REResponse {
        for (let i = 0; i < this._behaviors.length; i++) {
            const r = func(this._behaviors[i]);//this._behaviors[i].onPreAction(cmd);
            if (r != REResponse.Pass) {
                return r;
            }
        }
        return REResponse.Pass;
    }

    _callDecisionPhase(context: RECommandContext, phase: DecisionPhase): REResponse {
        return this._callBehaviorIterationHelper(b => b.onDecisionPhase(context, phase));
     }

    _sendPreAction(cmd: RECommand): REResponse {
        return this._callBehaviorIterationHelper(b => b.onPreAction(cmd));
    }

    _sendPreRection(cmd: RECommand): REResponse {
        return this._callBehaviorIterationHelper(b => b.onPreReaction(cmd));
    }

    _sendAction(cmd: RECommand): REResponse {
        return this._callBehaviorIterationHelper(b => b.onAction(cmd));
    }

    _sendReaction(cmd: RECommand): REResponse {
        return this._callBehaviorIterationHelper(b => b.onReaction(cmd));
    }

    constructor() {

        // TODO: Test
        this._eventData = {
            id: 0,
            name: "dynamc event",
            note: "",
            pages: [
                {
                    conditions: {
                        actorId: 1,
                        actorValid: false,
                        itemId: 1,
                        itemValid: false,
                        selfSwitchCh: "A",
                        selfSwitchValid: false,
                        switch1Id: 1,
                        switch1Valid: false,
                        switch2Id: 1,
                        switch2Valid: false,
                        variableId: 1,
                        variableValid: false,
                        variableValue: 1,
                    },
                    directionFix: false,
                    image: {
                        tileId: 0,
                        characterName: "Actor1",
                        direction: 2,
                        pattern: 0,
                        characterIndex: 1
                    },
                    list: [],
                    moveFrequency: 3,
                    moveRoute: {
                        list: [],
                        repeat: true,
                        skippable: false,
                        wait: false,
                    },
                    moveSpeed: 3,
                    moveType: 0,
                    priorityType: 1,
                    stepAnime: false,
                    through: false,
                    trigger: 0,
                    walkAnime: true,
                }
            ],
            x: 0,
            y: 0,
        }
    }
}

