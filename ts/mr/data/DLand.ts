
import { assert, tr, tr2 } from "../Common";
import { DAnnotationReader } from "./importers/DAnnotationReader";
import { DLandId, DMapId, DTerrainPresetId, DTerrainSettingId } from "./DCommon";
import { DEntitySpawner } from "./DSpawner";
import { DEntityCategory } from "./DEntityCategory";
import { DHelpers } from "./DHelper";
import { MRData } from "./MRData";
import { DMap } from "./DMap";
import { Diag } from "../Diag";
import { DValidationHelper } from "./DValidationHelper";
import { DFovSystem } from "./DSystem";

export enum DFloorClass {
    FloorMap = 0,
    EventMap = 1,
}

export enum DFloorMode {    // RMMZ のタイルセットモードから名前を付けてみた
    Field = "Field",
    Area = "Area",
}


export interface DAppearanceTableEntity {
    startFloorNumber: number;
    lastFloorNumber: number;
    spawiInfo: DEntitySpawner;
}

export interface DAppearanceTableEvent {
    startFloorNumber: number;
    lastFloorNumber: number;
    rmmzEventId: number;
}

export interface DAppearanceTableSet {
    /** すべての Entity と出現範囲 */
    entities: DAppearanceTableEntity[];

    maxFloors: number;

    /** Event のテーブル。 [フロア番号][] */
    events: DAppearanceTableEvent[][];

    /** 階段など、RESystem によって特別扱いされるもの。 [フロア番号0~][] */
    system: DAppearanceTableEntity[][];

    /** Enemy のテーブル。初期配置の他、ターン経過によって出現する。 [フロア番号0~][]  */
    enemies: DAppearanceTableEntity[][];

    /** Trap のテーブル。Item とは出現率が別管理なので、分けておく。 [フロア番号0~][]  */
    traps: DAppearanceTableEntity[][];

    /** Item のテーブル。Trap とは出現率が別管理なので、分けておく。 [フロア番号0~][] */
    items: DAppearanceTableEntity[][];

    /** Shop のテーブル。Item と、店主が含まれている。 [フロア番号0~][] */
    shop: DAppearanceTableEntity[][];
}

export class DFloorStructures {

}

export interface DFloorMonsterHousePattern {
    name: string;
    rating: number; // %
}

export class DTerrainSettingRef {
    terrainSettingsId: DTerrainSettingId;
    rating: number;

    public constructor(terrainSettingsId: DTerrainSettingId, rating: number) {
        this.terrainSettingsId = terrainSettingsId;
        this.rating = rating;
    }

    // public static parse(data: RMMZFloorMetadata): DTerrainSettingRef[] {
    //     if (data.presets) {
    //         return data.presets.map((x): DTerrainSettingRef => { 
    //             const key = (x[0] as string);
    //             const rate = (x[1] as number);
    //             return new DTerrainSettingRef(REData.getTerrainSetting(key).id, rate);
    //         });
    //     }
    //     else {
    //         return [new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_Default").id, 1)];
    //     }
    // }
}

export interface DFloorInfo {
    key: string;
    template: string | undefined;
    displayName: string | undefined;
    mode: DFloorMode;
    floorClass: DFloorClass;
    //fixedMapName: string;   // Land から固定マップへの遷移については LFloorId のコメント参照。
    fixedMapIndex: number;  // DLand.fixedMapIds のインデックス。-1 なら固定マップではない。
    eventMapIndex: number;

    /** false の場合は通常の RMMZ マップ。Entity は登場せず、Event を非表示にすることもない。 */
    //entitySystem: boolean;

    /** true の場合、アイテムを置いたり投げたりできない。[捨てる] ができるようになる。一般的な拠点マップを示す。 */
    safetyActions: boolean;

    /** true の場合、ターン経過で満腹度が減ったりする。 */
    //survival: boolean;

    bgmName: string;
    bgmVolume: 90;
    bgmPitch: number;

    presetId: DTerrainPresetId;

    unique: boolean;
    fovSystem: DFovSystem;
}

export enum DLandIdentificationLevel {
    /** 未識別 */
    Unknown,

    /** 種別識別済み */
    Kind,

    /** 個体識別済み */
    Entity,
}

export enum DLandForwardDirection {
    /** フロア数が増えるごとに、上の階へ向かう */
    Uphill,

    /** フロア数が増えるごとに、下の階へ向かう */
    Downhill,

    /** 概念的な上下移動を伴わない */
    Flat,
}

/** Land を抜けた時のステータスに対するルール */
export enum DLandExitStatusRule {
    /** グローバル設定を継承する */
    Default,

    /** 無し */
    None,

    /** 永続パラメータを含めて、全てのパラメータをリセットする */
    Initialize,
}

/** Land を抜けた時のインベントリに対するルール */
export enum DLandExitInventoryRule {
    /** グローバル設定を継承する */
    Default,

    /** 無し */
    None,

    /** 持ち物を全て削除する */
    Initialize,
}


export class DLandRule {

    // Land に入った時のルール
    //   高難易度ダンジョンは入る前に訓練場などでレベルを上げていたとしても、入ったときにリセットされるものがある。
    enteredStatus: DLandExitStatusRule;
    enteredInventory: DLandExitInventoryRule;

    conqueredStatus: DLandExitStatusRule;
    conqueredInventory: DLandExitInventoryRule;

    // ゲームオーバーやあきらめた時のルール
    abandonedStatus: DLandExitStatusRule;
    abandonedInventory: DLandExitInventoryRule;

    /*
    [2022/9/29] ゲームオーバー時にステータスをリセットするのはどのタイミングがよい？
    ----------
    ### Dungeon から Land へ遷移開始したとき
    - 画面暗転時に Window に表示されている HP が全快して見えてしまう。
        - これは多分、ExitMap が Vanilla に属していたのが原因。
    - 攻撃>戦闘不能処理>マップ遷移>ステータスリセット が同一のコマンドチェーンで実行されるため、ユニットテストが難しくなる。
    - 特定条件で、ゲームオーバーではなくイベントに遷移し、そこでの結果に応じて冒険に復帰、といったことができなくなる。
    おそらく、マップの移動に引っ掛けるよりはなんらか「冒険の終了宣言」に引っ掛けるのがよいのかもしれない。

    ### Dungeon から World への遷移が完了したとき
    ゲームオーバーでホームへ戻ったときや、クリアしてダンジョンの入口へ戻るときなど。



    */

    public constructor() {
        this.enteredStatus = DLandExitStatusRule.Default;
        this.enteredInventory = DLandExitInventoryRule.Default;
        this.conqueredStatus = DLandExitStatusRule.Default;
        this.conqueredInventory = DLandExitInventoryRule.Default;
        this.abandonedStatus = DLandExitStatusRule.Default;
        this.abandonedInventory = DLandExitInventoryRule.Default;
        // this.conqueredStatus = DLandExitStatusRule.Initialize;
        // this.conqueredInventory = DLandExitInventoryRule.None;
        // this.abandonedStatus = DLandExitStatusRule.Initialize;
        // this.abandonedInventory = DLandExitInventoryRule.Initialize;
    }
}

/**
 * ダンジョンや町ひとつ分。
 * 
 * Id=1 の Land は VanillaLand と呼ばれる。VanillaLand は、
 * - ゲーム開始時に自動的に生成される。
 * - いずれの Land にも属さない RmmzMap に対応する DMap は全てここに属する。
 * - RmmzMapId と等しい FloorNumber の Floor が存在する。Floor は歯抜けになっていることもある。
 */
export class DLand {
    /*
    World
    ----------
    - 基本的に FixedMap のみで構成される特殊な Land。
    - マップの内容は、マップを移動しても維持する。（倉庫が該当する）
    - 落とし穴などでフロア間移動しない。
    */


    /** ID (0 is Invalid). */
    id: number;

    name: string;

    /** Land の生成元になった、対応するツクール MapId (MR-Land:). */
    rmmzMapId: number;

    /** EventTable MapId. */
    eventTableMapId: number;
    
    /** ItemTable MapId. */
    itemTableMapId: number;
    
    /** EnemeyTable MapId. */
    enemyTableMapId: number;
    
    /** TrapTable MapId. */
    trapTableMapId: number;

    shopTableMapId: number;

    appearanceTable: DAppearanceTableSet;
    //eventTable: DAppearanceTable;
    //itemTable: DAppearanceTable;
    //enemyTable: DAppearanceTable;
    //trapTable: DAppearanceTable;

    //exitFloorId: DFloorId;

    /** @MR-Floor から読み取った Floor 情報 */
    // やっぱり EventMap もこれに含んでみる。LFloorInfo の誤用が多くなってしまったため。
    floorInfos: DFloorInfo[];
    lastFloorNumber: number;    // 最後のフロア番号

    /** Land に含まれるフロア ([0] is Invalid) 要素数は MRData.MAX_DUNGEON_FLOORS だが、最大フロア数ではないため注意。 */
    //floorIds: DMapId[];

    fixedMapIds: DMapId[];

    /** (index: DEntityKindId) */
    identifiedKinds: (DLandIdentificationLevel | undefined)[];

    forwardDirection: DLandForwardDirection;

    // イベントマップ。 ExitMap も含む。
    // FixedMap は含まない。FixedMap への遷移はつまり DungeonFloor への遷移であるため、EventMap への遷移と混同しないようにする。
    eventMapIds: DMapId[];
    
    
    /**
     * 主にシステムの都合で行先が明示されずに、Land から "出される" ときの移動先となるマップ。
     * ゲームオーバーや "脱出の巻物" などでダンジョンから抜けるときに参照される。
     * このマップは通過点として演出や遷移先の指定のみ利用する。
     */
    private _exitEventMapFlooNumber: number;

    private _isWorld: boolean;

    public constructor(id: DLandId, isWorld: boolean) {
        this.id = id;
        this.name = "null";
        this.rmmzMapId = 0;
        this.eventTableMapId = 0;
        this.itemTableMapId = 0;
        this.enemyTableMapId = 0;
        this.trapTableMapId = 0;
        this.shopTableMapId = 0;
        this.appearanceTable = {
            entities: [],
            maxFloors: 0,
            system: [],
            enemies: [],
            traps: [],
            items: [],
            events: [],
            shop: [],
        },
        //eventTable = { entities = [] },
        //itemTable = { entities = [] },
        //enemyTable = { entities = [] },
        //trapTable = { entities = [] },
        //exitFloorId = { landId = 0, floorNumber = 0 },
        this.floorInfos = [];
        this.lastFloorNumber = -1;
        //this.floorIds = [];
        this.fixedMapIds = [];
        this.eventMapIds = [];
        this._exitEventMapFlooNumber = -1;
        this.identifiedKinds = [];
        this.forwardDirection = DLandForwardDirection.Uphill;
        this._isWorld = isWorld;
    }

    //--------------------------------------------------------------------------
    // Validation

    public toDebugName(): string {
        return DValidationHelper.makeDataName("Land", this.id, this.name);
    }

    public validate(): void {
        if (this.id > 0 && !this.isVanillaLand) {
            if (this._exitEventMapFlooNumber <= 0) {
                Diag.error(this.toDebugName() + tr("の ExitMap が設定されていません。"));
            }
        }
    }

    //--------------------------------------------------------------------------

    public get isVanillaLand(): boolean {
        return DHelpers.isVanillaLand(this.id);
    }

    public get isWorldLand(): boolean {
        return this._isWorld;
    }

    // public get isDungeonLand(): boolean {
    //     return DHelpers.isDungeonLand(this.id);
    // }
    
    public get exitMapFloorNumber(): number {
        assert(this._exitEventMapFlooNumber >= 0);
        return this._exitEventMapFlooNumber;
    }

    // public get eventMapIds(): readonly DMapId[] {
    //     return this._eventMapIds;
    // }
    
    // public get exitMapId(): DMapId {
    //     assert(this._exitEventMapFlooNumber >= 0);
    //     return this._eventMapIds[this._exitEventMapIndex];
    // }

    // public get exitMapData(): DMap {
    //     return MRData.maps[this.exitMapId];
    // }


    public getFloorClass(mapData: DMap) {
        assert(mapData.landId === this.id);
        //if (this._exitMapId == mapData.id) return DFloorClass.ExitMap;
        if (!!this.eventMapIds.find(id => mapData.id)) return DFloorClass.EventMap;
        return DFloorClass.FloorMap;
    }

    // public getMapDataIndex(floorNumber: number): number {

    // }

    public getFixedMap(floorNumber: number): DMap | undefined {
        const floorInfo = this.floorInfos[floorNumber];
        if (!floorInfo) return undefined;
        if (floorInfo.fixedMapIndex < 0) return undefined;
        return MRData.maps[this.fixedMapIds[floorInfo.fixedMapIndex]];
    }

    public findFixedMapByName(name: string): DMap | undefined {
        if (!name) return undefined;
        const mapId = this.fixedMapIds.find(x => MRData.maps[x].name == name);
        if (!mapId) return undefined;
        return MRData.maps[mapId];
    }

    // 見つからない場合は -1.
    public findFloorNumberByMapId(mapId: DMapId): number {
        return this.floorInfos.findIndex(x => x && x.fixedMapIndex >= 0 && this.fixedMapIds[x.fixedMapIndex] === mapId);
    }

    public addEventMap(map: DMap): void {
        // assert(map.landId === 0);
        // map.landId = this.id;
        this.eventMapIds.push(map.id);

        // const info: DFloorInfo = {
        //     key: map.name,
        //     template: undefined,
        //     displayName: map.name,
        //     fixedMapIndex: -1,
        //     floorClass: DFloorClass.EventMap,
        //     safetyActions: true,
        //     bgmName: "",
        //     bgmVolume: 90,
        //     bgmPitch: 100,
        //     presetId: 1,
        //     unique: false,
        //     fovSystem: DFovSystem.RoomBounds,
        // };
        // this.floorInfos.push(info);
    }

    // public addEventMapAsExitMap(map: DMap): void {
    //     if (this._exitEventMapFlooNumber >= 0) Diag.error(this.toDebugName() + tr2("既に ExitMap が設定されています。"));
    //     //assert(map.landId === 0);
    //     assert(map.landId === this.id); // TODO: 一時的に許容
    //     map.landId = this.id;
    //     map.exitMap = true;
    //     this._eventMapIds.push(map.id);
        
    //     this._exitEventMapFlooNumber = this.floorInfos.length;
    //     const info: DFloorInfo = {
    //         key: map.name,
    //         template: undefined,
    //         displayName: map.name,
    //         fixedMapIndex: -1,
    //         floorClass: DFloorClass.EventMap,
    //         safetyActions: true,
    //         bgmName: "",
    //         bgmVolume: 90,
    //         bgmPitch: 100,
    //         presetId: 1,
    //         unique: false,
    //         fovSystem: DFovSystem.RoomBounds,
    //     };
    //     this.floorInfos.push(info);
    // }

    // public getFixedMapByName(name: string): DMap {
    //     const mapId = this.fixedMapIds.find(x => REData.maps[x].name == name);
    //     assert(mapId);
    //     return REData.maps[mapId];
    // }
    
    public import(mapData: IDataMap): void {
        
        this.floorInfos = this.buildFloorTable(mapData);
        this.lastFloorNumber = this.floorInfos.length - 1;
        this.appearanceTable = DLand.buildAppearanceTableSet(mapData, this.rmmzMapId, this.floorInfos.length);

        for (const event of mapData.events) {
            if (!event) continue;
            const data = DAnnotationReader.readLandAnnotation(event);
            if (data) {
                if (data.identifications) {
                    for (const pair of data.identifications) {
                        const tokens = pair.split(":");
                        const key = tokens[0];

                        if (key.toLowerCase() == "all") {
                            const level = this.parseLandIdentificationLevel(tokens[1].toLowerCase());
                            for (const kind of MRData.categories) {
                                this.identifiedKinds[kind.id] = level;
                            }
                        }
                        else {
                            const kind = MRData.getEntityCategory(key.toLowerCase());
                            this.identifiedKinds[kind.id] = this.parseLandIdentificationLevel(tokens[1].toLowerCase());
                        }
                    }
                }
                break;
            }
        }

        // EventMap の Floor は通常 Floor の後に追加したい
        for (let i = 0; i < this.eventMapIds.length; i++) {
            const mapId = this.eventMapIds[i];
            const mapData = MRData.maps[mapId];

            const info: DFloorInfo = {
                key: mapData.name,
                template: undefined,
                displayName: mapData.name,
                mode: DFloorMode.Area,
                floorClass: DFloorClass.EventMap,
                fixedMapIndex: -1,
                eventMapIndex: i,
                safetyActions: true,
                bgmName: "",
                bgmVolume: 90,
                bgmPitch: 100,
                presetId: 1,
                unique: false,
                fovSystem: DFovSystem.RoomBounds,
            };
            this.floorInfos.push(info);

            if (mapData.exitMap) {
                this._exitEventMapFlooNumber = this.floorInfos.length - 1;
            }
        }
    }

    private parseLandIdentificationLevel(str: string): DLandIdentificationLevel {
        switch (str) {
            case "entity":
                return DLandIdentificationLevel.Entity;
            case "kind":
                return DLandIdentificationLevel.Kind;
            default:
                throw new Error(`IdentificationLevel "${str}" is invalid.`);
        }
    }
    
    public checkIdentifiedKind(kind: DEntityCategory): boolean {
        const e = this.identifiedKinds[kind.id];
        if (!e) return false;   // 省略されているなら未識別
        return e >= DLandIdentificationLevel.Kind;
    }

    public checkIdentifiedEntity(kind: DEntityCategory): boolean {
        const e = this.identifiedKinds[kind.id];
        if (!e) return false;   // 省略されているなら未識別
        return e >= DLandIdentificationLevel.Entity;
    }

    private buildFloorTable(mapData: IDataMap): DFloorInfo[] {
        const floors: DFloorInfo[] = [];
        for (const event of mapData.events) {
            if (!event) continue;
            // @MR-Floor 設定を取り出す
            const floorData = DAnnotationReader.readFloorAnnotationFromPage(event.pages[0]);
            if (floorData) {
                const fixedMapName = floorData.fixedMap ?? "";
                const info: DFloorInfo = {
                    key: event.name,
                    template: floorData.template ?? undefined,
                    displayName: floorData.displayName ?? undefined,
                    mode: DHelpers.stringToEnum(floorData.mode, {
                        "Field": DFloorMode.Field,
                        "_": DFloorMode.Area,
                    }),
                    floorClass: DFloorClass.FloorMap,
                    fixedMapIndex: this.fixedMapIds.findIndex(x => MRData.maps[x].name == fixedMapName),
                    eventMapIndex: -1,
                    safetyActions: floorData.safety ?? false,
                    bgmName: floorData.bgm ? floorData.bgm[0] : "",
                    bgmVolume: floorData.bgm ? floorData.bgm[1] : 90,
                    bgmPitch: floorData.bgm ? floorData.bgm[2] : 100,
                    presetId: floorData.preset ? MRData.getFloorPreset(floorData.preset).id : 1,
                    unique: floorData.unique ?? false,
                    fovSystem: DHelpers.stringToEnum(floorData.fovSystem, {
                        "SymmetricShadowcast": DFovSystem.SymmetricShadowcast,
                        "_": DFovSystem.RoomBounds,
                    }),
                }

                const x2 = event.x + DHelpers.countSomeTilesRight_E(mapData, event.x, event.y);
                for (let x = event.x; x <= x2; x++) {
                    floors[x] = info;
                }

            }
        }
        return floors;
    }
        
    public static buildAppearanceTableSet(mapData: IDataMap, rmmzMapId: number, maxFloors: number): DAppearanceTableSet {
        
        const table: DAppearanceTableSet = { 
            entities: [],
            maxFloors: 0,
            system: [],
            enemies: [],
            traps: [],
            items: [],
            events: [],
            shop: [],
        };
        const eventList: DAppearanceTableEvent[] = [];
        table.maxFloors = mapData.width;

        // まずは Entity, Event を集計
        for (const event of mapData.events) {
            if (!event) continue;
            const x = event.x;
            const y = event.y;

            // @MR-Spawner
            const entityMetadata = DAnnotationReader.readSpawnerAnnotationFromPage(event.pages[0]);
            if (entityMetadata) {
                const spawnInfo = DEntitySpawner.makeFromEventData(event, rmmzMapId);
                if (!spawnInfo) {
                    throw new Error(`Entity "${entityMetadata.entity}" not found. (Map:${DHelpers.makeRmmzMapDebugName(rmmzMapId)}, Event:${event.id}.${event.name})`);
                }
                if (spawnInfo.entityId <= 0 && spawnInfo.troopId <= 0) {
                    throw new Error(`Entity "${spawnInfo.xName}" not found. (Map:${DHelpers.makeRmmzMapDebugName(rmmzMapId)}, Event:${event.id}.${event.name})`);
                }

                const tableItem: DAppearanceTableEntity = {
                    spawiInfo: spawnInfo,
                    startFloorNumber: x,
                    lastFloorNumber: x + DHelpers.countSomeTilesRight_E(mapData, x, y),
                };
                table.entities.push(tableItem);
                //table.maxFloors = Math.max(table.maxFloors, tableItem.lastFloorNumber + 1);
            }
            
            // @MR-Event
            const eventMetadata = DAnnotationReader.readREEventAnnotationFromPage(event.pages[0]);
            if (eventMetadata) {
                const tableItem: DAppearanceTableEvent = {
                    rmmzEventId: event.id,
                    startFloorNumber: x,
                    lastFloorNumber: x + DHelpers.countSomeTilesRight_E(mapData, x, y),
                };
                eventList.push(tableItem);
                //table.maxFloors = Math.max(table.maxFloors, tableItem.lastFloorNumber + 1);
            }
        }

        const floorCount = Math.max(table.maxFloors, maxFloors);
        table.system = new Array(floorCount);
        table.enemies = new Array(floorCount);
        table.traps = new Array(floorCount);
        table.items = new Array(floorCount);
        table.events = new Array(floorCount);
        table.shop = new Array(floorCount);
        for (let i = 0; i < floorCount; i++) {
            table.system[i] = [];
            table.enemies[i] = [];
            table.traps[i] = [];
            table.items[i] = [];
            table.events[i] = [];
            table.shop[i] = [];
        }

        for (const entity of table.entities) {
            const spawnInfo = entity.spawiInfo;
            for (let i = entity.startFloorNumber; i <= entity.lastFloorNumber; i++) {
                if (spawnInfo.troopId > 0) {
                    table.enemies[i].push(entity);        // troop は enemy と一緒にしてみる
                }
                else if (DEntityCategory.isMonster(spawnInfo.entityData())) {
                    table.enemies[i].push(entity);
                }
                else if (DEntityCategory.isTrap(spawnInfo.entityData())) {
                    table.traps[i].push(entity);
                }
                else if (DEntityCategory.isItem(spawnInfo.entityData())) {
                    table.items[i].push(entity);
                }
                else {
                    table.system[i].push(entity);
                }
            }
        }
        
        for (const event of eventList) {
            for (let i = event.startFloorNumber; i <= event.lastFloorNumber; i++) {
                table.events[i].push(event);
            }
        }

        return table;
    }
    
    public static buildSubAppearanceTable(land: DLand, mapData: IDataMap, rmmzMapId: number, tableSet: DAppearanceTableSet, table: DAppearanceTableEntity[][]): void {
        if (mapData.width != table.length) {
            throw new Error(tr2("%1に含まれる%2テーブルのマップサイズが一致していません。").format(land.name, $dataMapInfos[rmmzMapId]?.name));
        }

        assert(tableSet.maxFloors == table.length);

        // まずは Entity を集計
        const entities = [];
        for (const event of mapData.events) {
            if (!event) continue;
            const x = event.x;
            const y = event.y;

            // @MR-Spawner
            const entityMetadata = DAnnotationReader.readSpawnerAnnotationFromPage(event.pages[0]);
            if (entityMetadata) {
                const spawnInfo = DEntitySpawner.makeFromEventData(event, rmmzMapId);
                if (!spawnInfo) {
                    throw new Error(`Entity "${entityMetadata.entity}" not found. (Map:${DHelpers.makeRmmzMapDebugName(rmmzMapId)}, Event:${event.id}.${event.name})`);
                }

                const tableItem: DAppearanceTableEntity = {
                    spawiInfo: spawnInfo,
                    startFloorNumber: x,
                    lastFloorNumber: x + DHelpers.countSomeTilesRight_E(mapData, x, y),
                };
                entities.push(tableItem);
            }
        }

        for (let i = 0; i < tableSet.maxFloors; i++) {
            if (!table[i]) table[i] = [];
        }

        for (const entity of entities) {
            tableSet.entities.push(entity);
            for (let i = entity.startFloorNumber; i <= entity.lastFloorNumber; i++) {
                table[i].push(entity);
            }
        }
    }
}


