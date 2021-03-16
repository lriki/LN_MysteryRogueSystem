

export type DLandId = number;
export type DFloorId = number;

/**
 * ダンジョンや町ひとつ分。
 */
export interface DLand
{
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

    exitEMMZMapId: number;

    /** Land に含まれるフロア ([0] is Invalid) 要素数は RE_Data.MAX_DUNGEON_FLOORS だが、最大フロア数ではないため注意。 */
    floorIds: DFloorId[];
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
        exitEMMZMapId:0,
        floorIds: []
    };
}
