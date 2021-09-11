import { DEntity, DEntityCreateInfo, DEntityId } from "ts/data/DEntity";
import { DSystem } from "ts/data/DSystem";
import { REData } from "ts/data/REData";
import { LEntity } from "ts/objects/LEntity";
import { LFloorId } from "ts/objects/LFloorId";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";


export class USpawner {

    public static spawnSingleEntity(entityKey: string, mx: number, my: number): LEntity {
        const floorId = REGame.map.floorId();
        const entity = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity(entityKey).id), floorId);
        REGame.world._transferEntity(entity, floorId, mx, my);
        return entity;
    }

    public static getEnemiesFromSpawnTable(floorId: LFloorId): DEntity[] {
        const result = new Set<DEntityId>();

        const table = floorId.landData().appearanceTable;

        const enemyList = table.enemies[floorId.floorNumber()];
        if (enemyList) {
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
        }

        if (result.size == 0) {
            result.add(REData.system.fallbackEnemyEntityId);
        }
        
        return Array.from(result.values()).map(x => REData.entities[x]);
    }

}
