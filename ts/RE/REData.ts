

export enum REFloorMapKind
{
    FixedMap,
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
 * [2020/9/6] 
 * ----------
 * 元々は ItemGroup としていたが、もっと抽象的なものにする必要があった。
 * 持ち物一覧のアイコンと考えるとわかりやすい。
 * 武器、巻物といった一般的なアイテムの他、モンスターを持ち歩くこともできる。
 */
export interface RE_Data_EntityKind
{
    /** ID (0 is Invalid). */
    id: number;

    /** Name. */
    name: string;

    
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
    name: string;
}

export class REData
{
    static readonly MAX_DUNGEON_FLOORS = 100;

    // Standard entity kinds.
    static WeaponKindId: number;            // 武器
    static ShieldKindId: number;            // 盾
    static ArrowKindId: number;             // 矢
    static BraceletKindId: number;          // 腕輪
    static FoodKindId: number;              // 食料
    static HerbKindId: number;              // 草
    static ScrollKindId: number;            // 巻物
    static WandKindId: number;              // 杖
    static PotKindId: number;               // 壺
    static DiscountTicketKindId: number;    // 割引券
    static BuildingMaterialKindId: number;  // 建材
    static TrapKindId: number;              // 罠
    static FigurineKindId: number;          // 土偶
    static MonsterKindId: number;           // モンスター
    
    // Common defineds.
    static ActorDefaultFactionId: number = 1;
    static EnemeyDefaultFactionId: number = 2;
    
    static actors: RE_Data_Actor[] = [];
    static entityKinds: RE_Data_EntityKind[] = [];
    static lands: RE_Data_Land[] = [];
    static floors: (RE_Data_Floor | undefined)[] = [];    // 1~マップ最大数までは、MapId と一致する。それより後は Land の Floor.
    static factions: REData_Faction[] = [];
    static actions: REData_Action[] = [{id: 0, name: 'null'}];

    static addEntityKind(name: string): number {
        const newId = this.entityKinds.length + 1;
        this.entityKinds.push({
            id: newId,
            name: name
        });
        return newId;
    }
    
    static addLand(mapId: number): number {
        const newId = this.lands.length + 1;
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
    
    static addAction(name: string): number {
        const newId = this.actions.length + 1;
        this.actions.push({
            id: newId,
            name: name
        });
        return newId;
    }

    
    //----------------------------------------
    // Standard Actions.
    /**
     * 拾う・拾われる(拾われようとしている)・拾った
     * 
     * 壺に入れるのか、などの判断が必要になることがあるため、インベントリへの追加は sender が行う。
     * 
     * Reaction では Consumed を返す場合、
     */
    static PickActionId: number;

    /**
     * 置く・置かれる(置かれようとしている)・置いた
     * 
     * 
     *
     */
    static PutActionId: number;

    /** 交換
     * 
     *「拾う」>「置く」を1手で行う。
     * onAction では2つの Command を連続で送信し、
     * 
     */
    static ExchangeActionId: number;
}