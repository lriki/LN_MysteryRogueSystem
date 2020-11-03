import { REGame_Attribute } from "ts/RE/REGame_Attribute";
import { REGame_Behavior } from "ts/RE/REGame_Behavior";
import { REData_Attribute, REData_Behavior } from "./REDataTypes";


export enum REFloorMapKind
{
    // データ定義用のマップ。ここへの遷移は禁止
    Land,

    FixedMap,
    ShuffleMap,
    RandomMap,
}

/**
 * [2020/9/6] 種別によるクラス分類はしない
 * ----------
 * ツクールのように、Data_Item,Data_Weapon,Data_Armer といったクラス分けは行わない。
 * これは、
 * 1. 本システムとしてアイテムの効果はすべて Feature によって決まるものであるため。
 *    コンポーネント思考と同じ考え方で、Feature をアタッチすることで Item を作り上げていく。
 * 2. タイトルによっては種類の拡張があり得る。城の材料など。
 * 
 * ただし、武器、防具 あたりはツクールのデータベースからインポートしてくるため、
 * これらに対応する Item はデフォルトで 武器、防具の Feature を持つことになる。
 */
export interface RE_Data_Entity
{
    /** ID (0 is Invalid). */
    id : number;

    /** Name. */
    name: string;

    /** 買い値（販売価格） */
    buyingPrice: number;

    /** 売り値 */
    sellingPrice: number;

    /** Index of  */
    kindId: number;
}

/**
 * Entity の種別
 * 
 * Prefab 検索やソートキーなどで使われる。
 * 持ち物一覧のアイコンと考えるとわかりやすい。
 * 武器、巻物といった一般的なアイテムの他、モンスターを持ち歩くこともできる。
 * 
 * アイテム化け能力をもつモンスターなどにより、適宜オーバーライドされることはあるが、
 * Entity 1つに対して一意の表現となる。（「武器かつ盾」といった表現に使うものではない）
 * 
 * 勢力を表すものではない点に注意。例えば種別 "Monster" は、敵にも味方にもなれる。
 * 
 * 
 * 
 * [2020/9/6] 
 * ----------
 * 元々は ItemGroup としていたが、もっと抽象的なものにする必要があった。
 */
export interface RE_Data_EntityKind
{
    /** ID (0 is Invalid). */
    id: number;

    /** Name. */
    name: string;

    /** prefabKind. */
    prefabKind: string;

    
}

// NOTE: これをもとに Behavior を作る仕組みが必要そう。
export interface RE_Data_EntityFeature
{
    /** ID (0 is Invalid). */
    id: number;

    /** Name. */
    name: string;


}

/**
 * Actor はゲームシナリオ全体を通して存在する一意の登場人物を表すデータ構造。
 * 
 * ツクールの Actor とほぼ同義で、そこからインポートして使う。
 * ただし、必ずしも味方であるとは限らない。
 */
export interface RE_Data_Actor
{
    /** ID (0 is Invalid). */
    id: number;

    /** Name. */
    name: string;

    /** 初期配置フロア */
    initialFloorId: number;
    
    /** 初期配置 X */
    initialX: number;
    
    /** 初期配置 Y */
    initialY: number;
}





/**
 * ダンジョンや町ひとつ分。
 */
export interface RE_Data_Land
{
    /** ID (0 is Invalid). */
    id: number;

    /** Land に対応するツクール MapId. */
    mapId: number;

    /** EventTable MapId. */
    eventTableMapId: number;
    
    /** ItemTable MapId. */
    itemTableMapId: number;
    
    /** EnemeyTable MapId. */
    enemyTableMapId: number;
    
    /** TrapTable MapId. */
    trapTableMapId: number;

    /** Land に含まれるフロア ([0] is Invalid) 要素数は RE_Data.MAX_DUNGEON_FLOORS だが、最大フロア数ではないため注意。 */
    floorIds: number[];
}

/**
 * フロアひとつ分。
 * 
 * 負荷軽減のため、各テーブルは Player がダンジョンに入った時にロードされる。
 */
export interface RE_Data_Floor
{
    /** ID (0 is Invalid). */
    id: number;

    /** Parent Land. */
    landId: number;

    /** RMMZ mapID. (0 is RandomMap) */
    mapId: number;

    /** マップ生成 */
    mapKind: REFloorMapKind;
    

}

/**
 * 勢力
 */
export interface REData_Faction
{
    /** ID (0 is Invalid). */
    id: number;

    /** Name */
    name: string;

    /** 行動順 */
    schedulingOrder: number;
}

export type ActionId = number;

/**
 * 拾う、投げる、などの行動の種類
 * 
 * Command と密接に関係し、Command の種類 (というより発動の基点) を示すために使用する。
 * また、UI 状に表示される "ひろう" "なげる" といった表示名もここで定義する。
 * 
 * Command は dynamic なデータ構造だが、こちらは static.
 */
export interface REData_Action
{
    /** ID (0 is Invalid). */
    id: number;

    /** Name */
    displayName: string;
}

/**
 * REData_Sequel
 *
 * シミュレーション進行中に発生した、VisualAction を、View に伝えるためのデータ構造。
 * これ自体が具体的なスプライトの動作を定義するわけではない。
 * 「歩行」を再生するべき、「攻撃」を再生するべき、といったタイミングで作られる。
 * 
 * なお、歩行は複数アクターが並列で再生できる仕組みを作るのには、イベント発生タイミングを直接 View が
 * 購読してアニメ開始する方法では不可能。（Schedular が View の visualRunning() を監視している都合上不可能）
 * なので、アニメ再生系のイベントは一度キューに入れておいて、全アクターの歩行の処理が完了したら
 * 一斉にアニメーションさせるような流れを組む必要がある。
 * そのキューに入れる単位が REData_Sequel.
 */
export interface REData_Sequel
{
    /** ID (0 is Invalid). */
    id: number;

    /** Name */
    name: string;
}

export interface REData_Parameter
{
    /** ID (0 is Invalid). */
    id: number;

    /** Name */
    name: string;
}

export class REData
{
    static readonly MAX_DUNGEON_FLOORS = 100;

    
    // Common defineds.
    static ActorDefaultFactionId: number = 1;
    static EnemeyDefaultFactionId: number = 2;
    
    static entityKinds: RE_Data_EntityKind[] = [];
    static actors: RE_Data_Actor[] = [];
    static lands: RE_Data_Land[] = [];
    static floors: RE_Data_Floor[] = [];    // 1~マップ最大数までは、MapId と一致する。それより後は Land の Floor.
    static factions: REData_Faction[] = [];
    static actions: REData_Action[] = [{id: 0, displayName: 'null'}];
    static sequels: REData_Sequel[] = [{id: 0, name: 'null'}];
    static parameters: REData_Parameter[] = [{id: 0, name: 'null'}];
    static attributes: REData_Attribute[] = [{id: 0, name: 'null'}];
    static behaviors: REData_Behavior[] = [{id: 0, name: 'null'}];

    static _attributeFactories: (() => REGame_Attribute)[] = [];
    static _behaviorFactories: (() => REGame_Behavior)[] = [];

    static reset() {
        this.entityKinds = [{ id: 0, name: 'null', prefabKind: "" }];
        this.actors = [{ id: 0, name: 'null', initialFloorId: 0, initialX: 0, initialY: 0 }];
        this.lands = [{ id: 0, mapId: 0, eventTableMapId: 0, itemTableMapId: 0, enemyTableMapId: 0, trapTableMapId: 0, floorIds: [] }];
        this.floors = [{ id: 0, mapId: 0, landId: 0, mapKind: REFloorMapKind.FixedMap }];
        this.factions = [{ id: 0, name: 'null', schedulingOrder: 0 }];
        this.actions = [{id: 0, displayName: 'null'}];
        this.sequels = [{id: 0, name: 'null'}];
        this.parameters = [{id: 0, name: 'null'}];
        this.attributes = [{id: 0, name: 'null'}];
        this.behaviors = [{id: 0, name: 'null'}];
        this._attributeFactories = [() => new REGame_Attribute()];
        this._behaviorFactories = [() => new REGame_Behavior()];
    }

    static addEntityKind(name: string, prefabKind: string): number {
        const newId = this.entityKinds.length;
        this.entityKinds.push({
            id: newId,
            name: name,
            prefabKind: prefabKind,
        });
        return newId;
    }
    
    /**
     * Add actor.
     * @param mapId : RMMZ mapID
     */
    static addActor(name: string): number {
        const newId = this.actors.length;
        this.actors.push({
            id: newId,
            name: name,
            initialFloorId: 0,
            initialX: 0,
            initialY: 0,
        });
        return newId;
    }

    /**
     * Add land.
     * @param mapId : RMMZ mapID
     */
    static addLand(mapId: number): number {
        const newId = this.lands.length;
        this.lands.push({
            id: newId,
            mapId: mapId,
            eventTableMapId: 0,
            itemTableMapId: 0,
            enemyTableMapId: 0,
            trapTableMapId: 0,
            floorIds: [],
        });
        return newId;
    }
    
    /**
     * Add floor.
     * @param mapId : RMMZ mapID
     */
    static addFloor(mapId: number, landId: number, kind: REFloorMapKind): number {
        const newId = this.floors.length;
        this.floors.push({
            id: newId,
            mapId: mapId,
            landId: landId,
            mapKind: kind,
        });
        return newId;
    }
    
    static addAction(displayName: string): number {
        const newId = this.actions.length;
        this.actions.push({
            id: newId,
            displayName: displayName
        });
        return newId;
    }

    static addParameter(name: string): number {
        const newId = this.parameters.length;
        this.parameters.push({
            id: newId,
            name: name
        });
        return newId;
    }

    static addAttribute(name: string, factory: (() => REGame_Attribute)): number {
        const newId = this.attributes.length;
        this.attributes.push({
            id: newId,
            name: name,
        });
        this._attributeFactories.push(factory);
        return newId;
    }
    
    static addBehavior(name: string, factory: (() => REGame_Behavior)): number {
        const newId = this.behaviors.length;
        this.behaviors.push({
            id: newId,
            name: name,
        });
        this._behaviorFactories.push(factory);
        return newId;
    }
    
    //----------------------------------------
    // Standard Actions.

    static DirectionChangeActionId: number;

    /** 隣接タイルへの移動 */
    static MoveToAdjacentActionId: number;


    /**
     * 拾おうとしている・拾われようとしている・拾う・拾われた
     * 
     * 壺に入れるのか、矢束に混ぜるのかなどの判断が必要になることがあるため、インベントリへの追加は actor が行う。
     */
    static PickActionId: number;

    /**
     * 置こうとしている・置かれようとしている・置く・置かれた
     * 
     * Entity を Map に配置するのは actor 側にしてみる。(「撃つ」と同じ)
     * reactor 側で土偶オブジェクト化などが必要であれば、配置された状態から処理を始めることになる。
     */
    static PutActionId: number;

    /** 
     * 交換
     * 
     * [拾う][置く] とは区別する。お金を拾うとき、シレン5などでは [拾う] では所持金に加算されるが、[交換] ではアイテムと交換できる。
     * (SFC シレンではそうではないようだが http://twist.jpn.org/sfcsiren/index.php?%E3%82%AE%E3%82%BF%E3%83%B3%E6%8A%95%E3%81%92)
     */
    static ExchangeActionId: number;
    
    /**
     * 投げる
     */
    static ThrowActionId: number;
    
    /**
     * 放り投げる
     */
    static FlungActionId: number;

    /**
     * 撃つ
     * 
     * 矢束の数を減らすなど、単なる「投げる」とは異なるので分ける必要がある。
     * 
     * Projectile を作る必要があるが、そうしないと reactor は存在しないので、
     * 矢Entity のインスタンス化は actor 側で行う。
     * 
     * インスタンス化された Entity は actor と同じブロックに配置され、例えば矢であればそこから 10回 移動する。
     */
    static ShootingActionId: number;
    
    /**
     * 衝突しようとしている・衝突されようとしている・衝突する・衝突された
     * 
     * 投げられたり撃たれた Projectile が、他の Entity にヒットしたとき。
     * 
     * 草を投げ当てた時の効果発動とは分けている点に注意。
     * 例えば投げ与えられた装備品を装備する仲間キャラなどは、この Command をハンドリングする。
     * はね返しの盾なども同様。
     */
    static CollideActionId: number;

    /** 
     * 効果を与えようとしている・効果を与えられようとしている・効果を与える・効果を与えられた
     * 
     * 投げ当てた草等が実際に効果を発動するとき。
     * 命中判定などは済んだ後で発行されるコマンドなので、これをそのまま攻撃とみなして使うことはできないので注意。
     * 
     * 投げ当てた時と飲んだ時で効果が違うアイテムがあるので、その場合は EffectContext も参照する必要がある。
     */
    static AffectActionId: number;

    /**
     * 転がす
     *
     * いまのところ大砲の弾専用。
     * 大砲の弾は投げることもできるし (ウルロイド)、撃ったり (オヤジ戦車) 吹き飛ばすこともできる (杖)。転がっている間はワナが起動する。
     * これらとは原因アクションを区別するために、「転がす」が必要となる。
     */
    static RollActionId: number;
    
    /**
     * 落ちようとしている・落ちられようとしている・落ちる・落ちられた
     *
     * actor: Projectile(矢) 等
     * reactor: Tile, Trap 等
     *
     * Projectile が地面に落ちるときや、モンスターに投げられたときなど。
     * 落下先の同一レイヤーに Entity がある場合は周囲に落ちる。落ちるところが無ければ消滅する。
     * 
     * Trap に落下することもある。地雷や落とし穴であれば、周囲に落下はせず、ダメージを受けたり消滅する。
     * Trap に落下したときの Sequel 順序は 落下 > 起動音&発動中表示 > アイテム床へ落下 > ワナ効果発動
     * 
     */
    static FallActionId: number;

    /**
     * 落ちようとしている・落ちられようとしている・落ちる・落ちられた
     *
     * actor: Projectile(矢) 等
     * reactor: Tile 等
     * 
     * [Fall] と比べてこちらは Unit がアイテムをドロップした時の Action。
     * また、[Fall] で罠の上に落ちたアイテムが、さらに周囲の空いている Block へ落ちるときにも使用する。
     * 周辺がアイテムだらけでスペースがない場合は消滅する。
     */
    static DropActionId: number;

    /** 踏む */
    static StepOnActionId: number;

    /** 捨てる */
    static TrashActionId: number;

    // TODO: ↓このあたりは言葉がちがうだけでやることは同じなので、グループ化できるようにしてみたい
    /** 進む */
    static ProceedFloorActionId: number;
    /** 降りる */
    //static StairsDownActionId: number;
    /** 登る */
    //static StairsUpActionId: number;

    //----------------------------------------
    // Item Actions.
    
    /**
     * 装備しようとしている・装備されようとしている・装備する・装備された
     *
     */
    static EquipActionId: number;

    /**
     * (装備を)外そうとしている・外されようとしている・外す・外された
     *
     * 呪いのため外せないチェックは reactor(武器Entity) 側で行う。
     */
    static EquipOffActionId: number;

    /** 食べる */
    static EatActionId: number;

    /** 飲む (UI 表示名区別のため、[食べる] とは別定義。効果は同一でよさそう) */
    static TakeActionId: number;
    
    /** かじる (UI 表示名区別のため、[食べる] とは別定義。効果は同一でよさそう) */
    static BiteActionId: number;

    /** [43] 読む */
    static ReadActionId: number;

    /** [44] 振る */
    static SwingActionId: number;

    /** [45] 押す */
    static PushActionId: number;

    /** [46] 入れる */
    static PutInActionId: number;

    /** [47] 出す ※「みる（のぞく）」は Window 遷移のための UI アクションなので、CommandType ではない */
    static PickOutActionId: number;
    
    /**
     * 識別する
     * 
     * 巻物や草を使ったとき、手封じの壺を使ったとき、拾ったときなど、状況に応じて識別が発生するタイミングは多くあるため、
     * 必要な時に識別できるように Command 化しておく。
     */
    static IdentifyActionId: number;







    //----------------------------------------
    // Sequels.

    /** 移動 */
    static MoveSequel: number;
    
    /** 
     * 倒されたとき
     * 
     * Sequel はあくまで演出が目的なので、仮に CollapseSequel の発行を忘れたときでも
     * 演出が表示されないだけで Entity は消される等処理される。
     */
    static CollapseSequel: number;
}