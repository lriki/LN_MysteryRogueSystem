import { DEntity, DEntityId } from "ts/data/DEntity";
import { DSystem } from "ts/data/DSystem";
import { REData } from "ts/data/REData";
import { LFloorId } from "ts/objects/LFloorId";
import { REGame } from "ts/objects/REGame";


export class USpawner {

    public static getEnemiesFromSpawnTable(floorId: LFloorId): DEntity[] {
        const result = new Set<DEntityId>();

        const table = floorId.landData().appearanceTable;

        const enemyList = table.enemies[floorId.floorNumber()];
        for (const enemy of enemyList) {
            if (enemy.spawiInfo.troopId > 0) {
                // グループ出現
                const troop = REData.troops[enemy.spawiInfo.troopId];
                for (const m of troop.members) {
                    result.add(m);
                }
            }
            else {
                // 単体出現
                result.add(enemy.spawiInfo.entityId);
            }
        }

        if (result.size == 0) {
            result.add(REData.system.fallbackEnemyEntityId);
        }
        
        return Array.from(result.values()).map(x => REData.entities[x]);
    }

}
