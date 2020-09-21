import { REGame_Attribute } from "./REGame_Attribute";
import { RE_Game_Behavior } from "./REGame_Behavior";
import { REGame } from "./REGame";



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
export class RE_Game_Entity
{

    attrbutes: REGame_Attribute[] = [];
    behaviors: RE_Game_Behavior[] = [];

    _id: number = 0;
    _destroyed: boolean = false;

    // HC3 で作ってた CommonAttribute はこっちに持ってきた。
    // これらは Entity ごとに一意であるべきで、Framework が必要としている必須パラメータ。
    // Attribute よりはこっちに置いた方がいいだろう。
    _displayName: string = '';
    _iconName: string = '';
    _blockLayer: BlockLayer = BlockLayer.Unit;

    _eventData: IDataMapEvent | undefined = undefined;

    static newEntity(): RE_Game_Entity {
        const e = new RE_Game_Entity();
        REGame.world._addEntity(e);
        return e;
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

    // 継承 & 誤用防止
    private constructor() {

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

