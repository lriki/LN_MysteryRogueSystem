
import { DEntityCreateInfo, DEntitySpawner2 } from "./DEntity";
import { DHelpers, RmmzMonsterHouseMetadata } from "./DHelper";
import { DPrefabId } from "./DPrefab";
import { REData } from "./REData";


export type DLandId = number;
export type DMapId = number;

/*
export interface DFloorId {
    landId: DLandId;
    floorNumber: number;
}
*/

export interface DAppearanceTableEntity {
    startFloorNumber: number;
    lastFloorNumber: number;
    spawiInfo: DEntitySpawner2;
}

export interface DAppearanceTableEvent {
    startFloorNumber: number;
    lastFloorNumber: number;
    rmmzEventId: number;
}

export interface DAppearanceTable {
    /** すべての Entity と出現範囲 */
    entities: DAppearanceTableEntity[];

    maxFloors: number;

    /** 階段など、RESystem によって特別扱いされるもの。 [フロア番号][] */
    system: DAppearanceTableEntity[][];

    /** Enemy のテーブル。初期配置の他、ターン経過によって出現する。 [フロア番号][]  */
    enemies: DAppearanceTableEntity[][];

    /** Trap のテーブル。Item とは出現率が別管理なので、分けておく。 [フロア番号][]  */
    traps: DAppearanceTableEntity[][];

    /** Item のテーブル。Trap とは出現率が別管理なので、分けておく。 [フロア番号][] */
    items: DAppearanceTableEntity[][];

    /** Event のテーブル。 [フロア番号][] */
    events: DAppearanceTableEvent[][];
}

export class DFloorStructures {

}

export interface DFloorMonsterHousePattern {
    name: string;
    rating: number; // %
}

export class DFloorMonsterHouse {
    public rating: number;    // %
    public patterns: DFloorMonsterHousePattern[];

    constructor(data: RmmzMonsterHouseMetadata | undefined) {
        if (data) {
            this.rating = data.rate;
            this.patterns = data.patterns.map((x): DFloorMonsterHousePattern => { return { name: (x[0] as string), rating: (x[1] as number) }; });
        }
        else {
            this.rating = 0;
            this.patterns = [];
        }
    }
}

export interface DFloorInfo {
    key: string;
    template: string | undefined;
    displayName: string | undefined;
    fixedMapName: string;   // Land から固定マップへの遷移については LFloorId のコメント参照。

    /** false の場合は通常の RMMZ マップ。Entity は登場せず、Event を非表示にすることもない。 */
    //entitySystem: boolean;

    /** true の場合、アイテムを置いたり投げたりできない。[捨てる] ができるようになる。一般的な拠点マップを示す。 */
    safetyActions: boolean;

    /** true の場合、ターン経過で満腹度が減ったりする。 */
    //survival: boolean;

    bgmName: string;
    bgmVolume: 90;
    bgmPitch: number;

    //structures: DFloorStructures;
    monsterHouse: DFloorMonsterHouse;
}

/**
 * ダンジョンや町ひとつ分。
 */
export class DLand {
    /** ID (0 is Invalid). */
    id: number;

    name: string;

    /** Land の生成元になった、対応するツクール MapId (RE-Land:). */
    rmmzMapId: number;

    /** EventTable MapId. */
    eventTableMapId: number;
    
    /** ItemTable MapId. */
    itemTableMapId: number;
    
    /** EnemeyTable MapId. */
    enemyTableMapId: number;
    
    /** TrapTable MapId. */
    trapTableMapId: number;

    appearanceTable: DAppearanceTable;
    //eventTable: DAppearanceTable;
    //itemTable: DAppearanceTable;
    //enemyTable: DAppearanceTable;
    //trapTable: DAppearanceTable;

    /**
     * 主にシステムの都合で行先が明示されずに、Land から "出される" ときの移動先となるマップ。
     * ゲームオーバーや "脱出の巻物" などでダンジョンから抜けるときに参照される。
     * このマップは通過点として演出や遷移先の指定のみ利用する。REシステム管理下のマップではない。
     */
    exitRMMZMapId: number;
    //exitFloorId: DFloorId;

    /** @RE-Floor から読み取った Floor 情報 */
    floorInfos: DFloorInfo[];

    /** Land に含まれるフロア ([0] is Invalid) 要素数は RE_Data.MAX_DUNGEON_FLOORS だが、最大フロア数ではないため注意。 */
    floorIds: DMapId[];

    identifiedKinds: string[];

    public constructor(id: DLandId) {
        this.id = id;
        this.name = "null";
        this.rmmzMapId = 0;
        this.eventTableMapId = 0;
        this. itemTableMapId = 0;
        this.enemyTableMapId = 0;
        this.trapTableMapId = 0;
        this.appearanceTable = {
            entities: [],
            maxFloors: 0,
            system: [],
            enemies: [],
            traps: [],
            items: [],
            events: [],
        },
        //eventTable = { entities = [] },
        //itemTable = { entities = [] },
        //enemyTable = { entities = [] },
        //trapTable = { entities = [] },
        //exitFloorId = { landId = 0, floorNumber = 0 },
        this.exitRMMZMapId = 0;
        this.floorInfos = [];
        this.floorIds = [];
        this.identifiedKinds = [];
    }
    
    public import(mapData: IDataMap): void {
        
        this.floorInfos = DLand.buildFloorTable(mapData);
        this.appearanceTable = DLand.buildAppearanceTable(mapData, this.rmmzMapId);

        for (const event of mapData.events) {
            if (!event) continue;
            const data = DHelpers.readLandMetadata(event);
            if (data) {
                if (data.identified) this.identifiedKinds = data.identified.split(",");
                break;
            }
        }

    }

    public static buildFloorTable(mapData: IDataMap): DFloorInfo[] {
        const floors: DFloorInfo[] = [];
        for (const event of mapData.events) {
            if (!event) continue;
            // @RE-Floor 設定を取り出す
            const floorData = DHelpers.readFloorMetadataFromPage(event.pages[0], event.id);
            if (floorData) {
                //const structures = DHelpers.readStructuresMetadata(event);
                const monsterHouses = DHelpers.readMonsterHouseMetadata(event);

                const info: DFloorInfo = {
                    key: event.name,
                    template: floorData.template ?? undefined,
                    displayName: floorData.displayName ?? undefined,
                    fixedMapName: floorData.fixedMap ?? "",
                    safetyActions: floorData.safety ?? false,
                    bgmName: floorData.bgm ? floorData.bgm[0] : "",
                    bgmVolume: floorData.bgm ? floorData.bgm[1] : 90,
                    bgmPitch: floorData.bgm ? floorData.bgm[2] : 100,
                    monsterHouse: new DFloorMonsterHouse(monsterHouses),
                }

                const x2 = event.x + DHelpers.countSomeTilesRight_E(mapData, event.x, event.y);
                for (let x = event.x; x <= x2; x++) {
                    floors[x] = info;
                }

            }
        }
        return floors;
    }
        
    public static buildAppearanceTable(mapData: IDataMap, mapId: number): DAppearanceTable {
        
        const table: DAppearanceTable = { 
            entities: [],
            maxFloors: 0,
            system: [],
            enemies: [],
            traps: [],
            items: [],
            events: [],
        };
        const eventList: DAppearanceTableEvent[] = [];

        // まずは Entity, Event を集計し、maxFloors を調べる
        for (const event of mapData.events) {
            if (!event) continue;
            const x = event.x;
            const y = event.y;

            // @RE-Entity
            const entityMetadata = DHelpers.readEntityMetadataFromPage(event.pages[0], event.id);
            if (entityMetadata) {

                //const entityData = REData.findEntity(entityMetadata.data);
                //if (!entityData) {
                //    throw new Error(`Entity "${entityMetadata.data}" not found. (Map:${DHelpers.makeRmmzMapDebugName(mapId)}, Event:${event.id}.${event.name})`);
                //}
                const spawnInfo = DEntitySpawner2.makeFromEventData(event);
                if (!spawnInfo) {
                    throw new Error(`Entity "${entityMetadata.data}" not found. (Map:${DHelpers.makeRmmzMapDebugName(mapId)}, Event:${event.id}.${event.name})`);
                }

                const tableItem: DAppearanceTableEntity = {
                    spawiInfo: spawnInfo,
                    startFloorNumber: x,
                    lastFloorNumber: x + DHelpers.countSomeTilesRight_E(mapData, x, y),
                };
                table.entities.push(tableItem);
                table.maxFloors = Math.max(table.maxFloors, tableItem.lastFloorNumber + 1);
            }
            
            // @RE-Event
            const eventMetadata = DHelpers.readREEventMetadataFromPage(event.pages[0]);
            if (eventMetadata) {
                const tableItem: DAppearanceTableEvent = {
                    rmmzEventId: event.id,
                    startFloorNumber: x,
                    lastFloorNumber: x + DHelpers.countSomeTilesRight_E(mapData, x, y),
                };
                eventList.push(tableItem);
                table.maxFloors = Math.max(table.maxFloors, tableItem.lastFloorNumber + 1);
            }
        }

        table.system = new Array(table.maxFloors);
        table.enemies = new Array(table.maxFloors);
        table.traps = new Array(table.maxFloors);
        table.items = new Array(table.maxFloors);
        table.events = new Array(table.maxFloors);
        for (let i = 0; i < table.maxFloors; i++) {
            table.system[i] = [];
            table.enemies[i] = [];
            table.traps[i] = [];
            table.items[i] = [];
            table.events[i] = [];
        }

        for (const entity of table.entities) {
            const spawnInfo = entity.spawiInfo;
            for (let i = entity.startFloorNumber; i <= entity.lastFloorNumber; i++) {
                if (spawnInfo.troopId > 0) {
                    table.enemies[i].push(entity);        // troop は enemy と一緒にしてみる
                }
                else if (spawnInfo.isEnemyKind()) {
                    table.enemies[i].push(entity);
                }
                else if (spawnInfo.isTrapKind()) {
                    table.traps[i].push(entity);
                }
                else if (spawnInfo.isItemKind()) {
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
}


