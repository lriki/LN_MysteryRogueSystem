
import { DHelpers } from "./DHelper";


export type DLandId = number;
export type DMapId = number;

export interface DAppearanceTableEntity {
    prefabName: string;
    startFloorNumber: number;
    lastFloorNumber: number;
}


export interface DAppearanceTable {
    entities: DAppearanceTableEntity[];
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

    /** Land に対応するツクール MapId. */
    rmmzMapId: number;

    /** EventTable MapId. */
    eventTableMapId: number;
    
    /** ItemTable MapId. */
    itemTableMapId: number;
    
    /** EnemeyTable MapId. */
    enemyTableMapId: number;
    
    /** TrapTable MapId. */
    trapTableMapId: number;

    eventTable: DAppearanceTable;
    itemTable: DAppearanceTable;
    enemyTable: DAppearanceTable;
    trapTable: DAppearanceTable;

    exitEMMZMapId: number;

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
        eventTable: { entities: [] },
        itemTable: { entities: [] },
        enemyTable: { entities: [] },
        trapTable: { entities: [] },
        exitEMMZMapId:0,
        floorInfos: [],
        floorIds: []
    };
}

export function buildFloorTable(mapData: IDataMap): DFloorInfo[] {
    const floors: DFloorInfo[] = [];
    for (const event of mapData.events) {
        if (!event) continue;
        const floorData = DHelpers.readFloorMetadataFromPage(event.pages[0], event.id);
        if (floorData) {
            floors[event.x] = {
                fixedMapName: floorData.fixedMap ?? "",
            };
        }
    }
    console.log("floors", floors);
    return floors;
}

export function buildAppearanceTable(mapData: IDataMap): DAppearanceTable {
    
    const topTile = function(x: number, y: number): number {
        for (let z = 3; z >= 0; z--) {
            const tile = mapData.data[(z * mapData.height + y) * mapData.width + x] || 0;
            if (tile > 0) return tile;
        }
        return 0;
    };

    const findEvent = function(x: number, y: number): IDataMapEvent | undefined {
        for (const event of mapData.events) {
            if (event && event.x == x && event.y == y) {
                return event;
            }
        }
        return undefined;
    }

    const table: DAppearanceTable = { entities: [] };

    for (const event of mapData.events) {
        if (!event) continue;
        const entityMetadata = DHelpers.readEntityMetadataFromPage(event.pages[0], event.id);
        if (entityMetadata) {
            const x = event.x;
            const y = event.y;

            const baseTile = topTile(x, y);
            let x2 = x + 1;

            // 右へ伸びるタイルをカウントするときは E タイルのみを対象とする
            if (Tilemap.TILE_ID_E <= baseTile && baseTile < Tilemap.TILE_ID_A5) {
                for (; x2 < mapData.width; x2++) {
                    if (baseTile != topTile(x2, y) || findEvent(x2, y)) {
                        
                        break;
                    }
                }
            }
            
            const entity: DAppearanceTableEntity = {
                prefabName: entityMetadata.prefab,
                startFloorNumber: x,
                lastFloorNumber: x2 - 1,
            };
            table.entities.push(entity);
        }
    }

    //console.log("table", table);
    //throw new Error("stop");
    

    return { entities: [] };
}