
import { assert, tr2 } from "../Common";
import { DAnnotationReader, RmmzFloorRawAttribute } from "./DAttributeReader";
import { DTerrainPresetId, DTerrainSettingId } from "./DCommon";
import { DEntityCreateInfo, DEntitySpawner2 } from "./DEntity";
import { DEntityKind } from "./DEntityKind";
import { DHelpers } from "./DHelper";
import { DPrefabId } from "./DPrefab";
import { DMap, MRData } from "./MRData";


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

    presetId: DTerrainPresetId;
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

/**
 * ダンジョンや町ひとつ分。
 */
export class DLand {
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

    /**
     * 主にシステムの都合で行先が明示されずに、Land から "出される" ときの移動先となるマップ。
     * ゲームオーバーや "脱出の巻物" などでダンジョンから抜けるときに参照される。
     * このマップは通過点として演出や遷移先の指定のみ利用する。REシステム管理下のマップではない。
     */
    exitRMMZMapId: number;
    //exitFloorId: DFloorId;

    /** @MR-Floor から読み取った Floor 情報 */
    floorInfos: DFloorInfo[];

    /** Land に含まれるフロア ([0] is Invalid) 要素数は MRData.MAX_DUNGEON_FLOORS だが、最大フロア数ではないため注意。 */
    floorIds: DMapId[];

    fixedMapIds: DMapId[];

    /** (index: DEntityKindId) */
    identifiedKinds: (DLandIdentificationLevel | undefined)[];

    forwardDirection: DLandForwardDirection;

    public constructor(id: DLandId) {
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
        this.exitRMMZMapId = 0;
        this.floorInfos = [];
        this.floorIds = [];
        this.fixedMapIds = [];
        this.identifiedKinds = [];
        this.forwardDirection = DLandForwardDirection.Uphill;
    }

    public findFixedMapByName(name: string): DMap | undefined {
        if (!name) return undefined;
        const mapId = this.fixedMapIds.find(x => MRData.maps[x].name == name);
        if (!mapId) return undefined;
        return MRData.maps[mapId];
    }

    // public getFixedMapByName(name: string): DMap {
    //     const mapId = this.fixedMapIds.find(x => REData.maps[x].name == name);
    //     assert(mapId);
    //     return REData.maps[mapId];
    // }
    
    public import(mapData: IDataMap): void {
        
        this.floorInfos = DLand.buildFloorTable(mapData);
        this.appearanceTable = DLand.buildAppearanceTableSet(mapData, this.rmmzMapId, this.floorInfos.length);

        for (const event of mapData.events) {
            if (!event) continue;
            const data = DAnnotationReader.readLandMetadata(event);
            if (data) {
                if (data.identifications) {
                    for (const pair of data.identifications) {
                        const tokens = pair.split(":");
                        const key = tokens[0];

                        if (key.toLowerCase() == "all") {
                            const level = this.parseLandIdentificationLevel(tokens[1].toLowerCase());
                            for (const kind of MRData.entityKinds) {
                                this.identifiedKinds[kind.id] = level;
                            }
                        }
                        else {
                            const kind = MRData.getEntityKind(key.toLowerCase());
                            this.identifiedKinds[kind.id] = this.parseLandIdentificationLevel(tokens[1].toLowerCase());
                        }
                    }
                }
                break;
            }
        }

        // Pick prefab
        for (const event of mapData.events) {
            if (event) {
                const prefabData = DAnnotationReader.readPrefabMetadata(event, this.rmmzMapId);
                if (prefabData) {
                    const prefab = MRData.newPrefab();
                    prefab.rmmzMapId = this.rmmzMapId;
                    prefab.rmmzEventData = event;
                }
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
    
    public checkIdentifiedKind(kind: DEntityKind): boolean {
        const e = this.identifiedKinds[kind.id];
        if (!e) return false;   // 省略されているなら未識別
        return e >= DLandIdentificationLevel.Kind;
    }

    public checkIdentifiedEntity(kind: DEntityKind): boolean {
        const e = this.identifiedKinds[kind.id];
        if (!e) return false;   // 省略されているなら未識別
        return e >= DLandIdentificationLevel.Entity;
    }

    public static buildFloorTable(mapData: IDataMap): DFloorInfo[] {
        const floors: DFloorInfo[] = [];
        for (const event of mapData.events) {
            if (!event) continue;
            // @MR-Floor 設定を取り出す
            const floorData = DAnnotationReader.readFloorMetadataFromPage(event.pages[0]);
            if (floorData) {

                const info: DFloorInfo = {
                    key: event.name,
                    template: floorData.template ?? undefined,
                    displayName: floorData.displayName ?? undefined,
                    fixedMapName: floorData.fixedMap ?? "",
                    safetyActions: floorData.safety ?? false,
                    bgmName: floorData.bgm ? floorData.bgm[0] : "",
                    bgmVolume: floorData.bgm ? floorData.bgm[1] : 90,
                    bgmPitch: floorData.bgm ? floorData.bgm[2] : 100,
                    presetId: floorData.preset ? MRData.getFloorPreset(floorData.preset).id : 1,
                }

                const x2 = event.x + DHelpers.countSomeTilesRight_E(mapData, event.x, event.y);
                for (let x = event.x; x <= x2; x++) {
                    floors[x] = info;
                }

            }
        }
        return floors;
    }
        
    public static buildAppearanceTableSet(mapData: IDataMap, mapId: number, maxFloors: number): DAppearanceTableSet {
        
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
            const entityMetadata = DAnnotationReader.readEntityMetadataFromPage(event.pages[0]);
            if (entityMetadata) {
                const spawnInfo = DEntitySpawner2.makeFromEventData(event);
                if (!spawnInfo) {
                    throw new Error(`Entity "${entityMetadata.entity}" not found. (Map:${DHelpers.makeRmmzMapDebugName(mapId)}, Event:${event.id}.${event.name})`);
                }
                if (spawnInfo.entityId <= 0 && spawnInfo.troopId <= 0) {
                    throw new Error(`Entity "${spawnInfo.xName}" not found. (Map:${DHelpers.makeRmmzMapDebugName(mapId)}, Event:${event.id}.${event.name})`);
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
            const eventMetadata = DAnnotationReader.readREEventMetadataFromPage(event.pages[0]);
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
                else if (DEntityKind.isMonster(spawnInfo.entityData())) {
                    table.enemies[i].push(entity);
                }
                else if (DEntityKind.isTrap(spawnInfo.entityData())) {
                    table.traps[i].push(entity);
                }
                else if (DEntityKind.isItem(spawnInfo.entityData())) {
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
    
    public static buildSubAppearanceTable(land: DLand, mapData: IDataMap, mapId: number, tableSet: DAppearanceTableSet, table: DAppearanceTableEntity[][]): void {
        if (mapData.width != table.length) {
            throw new Error(tr2("%1に含まれる%2テーブルのマップサイズが一致していません。").format(land.name, $dataMapInfos[mapId]?.name));
        }

        assert(tableSet.maxFloors == table.length);

        // まずは Entity を集計
        const entities = [];
        for (const event of mapData.events) {
            if (!event) continue;
            const x = event.x;
            const y = event.y;

            // @MR-Spawner
            const entityMetadata = DAnnotationReader.readEntityMetadataFromPage(event.pages[0]);
            if (entityMetadata) {
                const spawnInfo = DEntitySpawner2.makeFromEventData(event);
                if (!spawnInfo) {
                    throw new Error(`Entity "${entityMetadata.entity}" not found. (Map:${DHelpers.makeRmmzMapDebugName(mapId)}, Event:${event.id}.${event.name})`);
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


