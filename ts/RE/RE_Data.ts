

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
    id : number;

    /** Name. */
    name: string;

    
}

// NOTE: これをもとに Behavior を作る仕組みが必要そう。
export interface RE_Data_EntityFeature
{
    /** ID (0 is Invalid). */
    id : number;

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
    id : number;

    /** Name. */
    name: string;


}





/**
 * ダンジョンや町ひとつ分。
 */
export interface RE_Data_Land
{
    /** ID (0 is Invalid). */
    id : number;

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

    /** Land に含まれるフロア。要素数はダンジョンのフロア数に等しい。([0] is Invalid) */
    //floorIds: number[];
}

/**
 * フロアひとつ分。
 * 
 * 負荷軽減のため、各テーブルは Player がダンジョンに入った時にロードされる。
 */
export interface RE_Data_Floor
{
    /** ID (0 is Invalid). */
    id : number;



}

export class RE_Data
{
    // Standard entity kinds.
    static WeaponKindId: number;
    static ShieldKindId: number;
    static ArrowKindId: number;
    static BraceletKindId: number;
    static FoodKindId: number;
    static HerbKindId: number;
    static ScrollKindId: number;
    static WandKindId: number;
    static PotKindId: number;
    static DiscountTicketKindId: number;
    static BuildingMaterialKindId: number;
    static TrapKindId: number;
    static FigurineKindId: number;
    static MonsterKindId: number;
    
    
    static actors: RE_Data_Actor[] = [];
    static entityKinds: RE_Data_EntityKind[] = [];
    static lands: RE_Data_Land[] = [];
    static floors: RE_Data_Floor[] = [];    // MapId と一致する

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
        });
        return newId;
    }
}