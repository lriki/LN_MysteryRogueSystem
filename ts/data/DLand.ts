
import { DEntity, DEntity_Default } from "./DEntity";
import { DHelpers } from "./DHelper";
import { DPrefabId, DPrefabKind } from "./DPrefab";
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
    entity: DEntity;
    prefabName: string;
    startFloorNumber: number;
    lastFloorNumber: number;
}


export interface DAppearanceTable {
    /** すべての Entity と出現範囲 */
    entities: DAppearanceTableEntity[];

    maxFloors: number;
    others: DAppearanceTableEntity[][];
    enemies: DAppearanceTableEntity[][];
    traps: DAppearanceTableEntity[][];
    items: DAppearanceTableEntity[][];
}

export interface DFloorInfo {
    fixedMapName: string;
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
            others: [],
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
            floors[event.x] = {
                fixedMapName: floorData.fixedMap ?? "",
            };
        }
    }
    return floors;
}

export function buildAppearanceTable(mapData: IDataMap, mapId: number): DAppearanceTable {
    

    const findEvent = function(x: number, y: number): IDataMapEvent | undefined {
        for (const event of mapData.events) {
            if (event && event.x == x && event.y == y) {
                return event;
            }
        }
        return undefined;
    }

    const table: DAppearanceTable = { 
        entities: [],
        maxFloors: 0,
        others: [],
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

            const baseTile = DHelpers.getMapTopTile(mapData, x, y);
            let x2 = x + 1;

            // 右へ伸びるタイルをカウントするときは E タイルのみを対象とする
            if (DHelpers.TILE_ID_E <= baseTile && baseTile < DHelpers.TILE_ID_A5) {
                for (; x2 < mapData.width; x2++) {
                    if (baseTile != DHelpers.getMapTopTile(mapData, x2, y) || findEvent(x2, y)) {
                        
                        break;
                    }
                }
            }
            
            const tableItem: DAppearanceTableEntity = {
                prefabName: entityMetadata.prefab,
                startFloorNumber: x,
                lastFloorNumber: x2 - 1,
                entity: {
                    ...DEntity_Default(),
                    prefabId: REData.prefabs.findIndex(p => p.key == entityMetadata.prefab),
                }
            };
            table.entities.push(tableItem);

            if (tableItem.entity.prefabId <= 0) {
                throw new Error(`Prefab "${tableItem.prefabName}" not found. (Map:${DHelpers.makeRmmzMapDebugName(mapId)}, Event:${event.id}.${event.name})`);
            }

            table.maxFloors = Math.max(table.maxFloors, tableItem.lastFloorNumber + 1);
        }
    }

    table.others = new Array(table.maxFloors);
    table.enemies = new Array(table.maxFloors);
    table.traps = new Array(table.maxFloors);
    table.items = new Array(table.maxFloors);
    for (let i = 0; i < table.maxFloors; i++) {
        table.others[i] = [];
        table.enemies[i] = [];
        table.traps[i] = [];
        table.items[i] = [];
    }

    for (const entity of table.entities) {
        const prefab = REData.prefabs[entity.entity.prefabId];
        for (let i = entity.startFloorNumber; i <= entity.lastFloorNumber; i++) {
            switch (prefab.kind) {
                case DPrefabKind.Enemy:
                    table.enemies[i].push(entity);
                    break;
                case DPrefabKind.Trap:
                    table.traps[i].push(entity);
                    break;
                case DPrefabKind.Item:
                    table.items[i].push(entity);
                    break;
                default:
                    table.others[i].push(entity);
                    break;
            }
        }
    }

    return table;
}