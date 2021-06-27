
import { DEntitySpawner } from "./DEntity";
import { DHelpers } from "./DHelper";
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
    entity: DEntitySpawner;
    prefabName: string; // TODO: 必要？
    startFloorNumber: number;
    lastFloorNumber: number;
}


export interface DAppearanceTable {
    /** すべての Entity と出現範囲 */
    entities: DAppearanceTableEntity[];

    maxFloors: number;

    /** 階段など、RESystem によって特別扱いされるもの。 */
    system: DAppearanceTableEntity[][];

    /** Enemy のテーブル。初期配置の他、ターン経過によって出現する。 */
    enemies: DAppearanceTableEntity[][];

    /** Trap のテーブル。Item とは出現率が別管理なので、分けておく。 */
    traps: DAppearanceTableEntity[][];

    /** Item のテーブル。Trap とは出現率が別管理なので、分けておく。 */
    items: DAppearanceTableEntity[][];
}

export interface DFloorInfo {
    template: string | undefined;
    displayName: string | undefined;
    fixedMapName: string;

    /** false の場合は通常の RMMZ マップ。Entity は登場せず、Event を非表示にすることもない。 */
    //entitySystem: boolean;

    /** true の場合、アイテムを置いたり投げたりできない。[捨てる] ができるようになる。一般的な拠点マップを示す。 */
    safetyActions: boolean;

    /** true の場合、ターン経過で満腹度が減ったりする。 */
    //survival: boolean;

    bgmName: string;
    bgmVolume: 90;
    bgmPitch: number;
}

/**
 * ダンジョンや町ひとつ分。
 */
export interface DLand {
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
}

export function DLand_Default(): DLand {
    return {
        id: 0,
        name: "null",
        rmmzMapId: 0,
        eventTableMapId: 0,
        itemTableMapId: 0,
        enemyTableMapId: 0,
        trapTableMapId: 0,
        appearanceTable: {
            entities: [],
            maxFloors: 0,
            system: [],
            enemies: [],
            traps: [],
            items: [],
        },
        //eventTable: { entities: [] },
        //itemTable: { entities: [] },
        //enemyTable: { entities: [] },
        //trapTable: { entities: [] },
        //exitFloorId: { landId: 0, floorNumber: 0 },
        exitRMMZMapId: 0,
        floorInfos: [],
        floorIds: []
    };
}

export function buildFloorTable(mapData: IDataMap): DFloorInfo[] {
    const floors: DFloorInfo[] = [];
    for (const event of mapData.events) {
        if (!event) continue;
        // @RE-Floor 設定を取り出す
        const floorData = DHelpers.readFloorMetadataFromPage(event.pages[0], event.id);
        if (floorData) {
            const info: DFloorInfo = {
                template: floorData.template ?? undefined,
                displayName: floorData.displayName ?? undefined,
                fixedMapName: floorData.fixedMap ?? "",
                safetyActions: floorData.safety ?? false,
                bgmName: floorData.bgm ? floorData.bgm[0] : "",
                bgmVolume: floorData.bgm ? floorData.bgm[1] : 90,
                bgmPitch: floorData.bgm ? floorData.bgm[2] : 100,
            }

            const x2 = event.x + DHelpers.countSomeTilesRight_E(mapData, event.x, event.y);
            for (let x = event.x; x <= x2; x++) {
                floors[x] = info;
            }

        }
    }
    return floors;
}

export function buildAppearanceTable(mapData: IDataMap, mapId: number): DAppearanceTable {
    


    const table: DAppearanceTable = { 
        entities: [],
        maxFloors: 0,
        system: [],
        enemies: [],
        traps: [],
        items: [],
    };

    for (const event of mapData.events) {
        if (!event) continue;
        const entityMetadata = DHelpers.readEntityMetadataFromPage(event.pages[0], event.id);
        if (entityMetadata) {
            const x = event.x;
            const y = event.y;

            const entityData = REData.findEntity(entityMetadata.data);
            if (!entityData) {
                throw new Error(`Entity "${entityMetadata.data}" not found. (Map:${DHelpers.makeRmmzMapDebugName(mapId)}, Event:${event.id}.${event.name})`);
            }

            const tableItem: DAppearanceTableEntity = {
                prefabName: REData.prefabs[entityData.prefabId].key,
                startFloorNumber: x,
                lastFloorNumber: x + DHelpers.countSomeTilesRight_E(mapData, x, y),
                entity: DEntitySpawner.makeSingle(entityData.id),
            };
            table.entities.push(tableItem);

            table.maxFloors = Math.max(table.maxFloors, tableItem.lastFloorNumber + 1);
        }
    }

    table.system = new Array(table.maxFloors);
    table.enemies = new Array(table.maxFloors);
    table.traps = new Array(table.maxFloors);
    table.items = new Array(table.maxFloors);
    for (let i = 0; i < table.maxFloors; i++) {
        table.system[i] = [];
        table.enemies[i] = [];
        table.traps[i] = [];
        table.items[i] = [];
    }

    for (const entity of table.entities) {
        const entityData = REData.entities[entity.entity.entityId];
        const prefab = REData.prefabs[entityData.prefabId];
        for (let i = entity.startFloorNumber; i <= entity.lastFloorNumber; i++) {

            if (prefab.isEnemyKind()) {
                table.enemies[i].push(entity);
            }
            else if (prefab.isTrapKind()) {
                table.traps[i].push(entity);
            }
            else if (prefab.isItemKind()) {
                table.items[i].push(entity);
            }
            else {
                table.system[i].push(entity);
            }
        }
    }

    return table;
}