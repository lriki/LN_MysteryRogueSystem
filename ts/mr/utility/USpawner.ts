import { DEntity, DEntityCreateInfo, DEntityId } from "ts/mr/data/DEntity";
import { MRData } from "ts/mr/data/MRData";
import { LEntity } from "ts/mr/lively/LEntity";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { DAppearanceTableEntity } from "../data/DLand";
import { LRandom } from "../lively/LRandom";
import { UEffect } from "./UEffect";


export class USpawner {

    public static spawnSingleEntity(entityKey: string, mx: number, my: number): LEntity {
        const floorId = MRLively.camera.currentMap.floorId();
        const entity = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity(entityKey).id), floorId);
        MRLively.world.transferEntity(undefined, entity, floorId, mx, my);
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
                    const troop = MRData.troops[enemy.spawiInfo.troopId];
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
            result.add(MRData.system.fallbackEnemyEntityId);
        }
        
        return Array.from(result.values()).map(x => MRData.entities[x]);
    }

    /**
     * 指定したフロアの出現テーブルから、アイテムを作成する。
     * 作成したアイテムはマップ上に出現していない。
     */
    public static createItemFromSpawnTable(floorId: LFloorId, rand: LRandom): LEntity | undefined {
        const table = floorId.landData().appearanceTable;
        if (table.items.length == 0) return undefined;    // 出現テーブルが空
        const list = table.items[floorId.floorNumber()];
        if (list.length == 0) return undefined;    // 出現テーブルが空

        const data = UEffect.selectRatingForce<DAppearanceTableEntity>(rand, list, 100, x => x.spawiInfo.rate);
        const entity = SEntityFactory.newEntity(data.spawiInfo, floorId);
        return entity;
    }
    
    /**
     * 指定したフロアの出現テーブルから、罠を作成する。
     * 作成したアイテムはマップ上に出現していない。
     */
    public static createTrapFromSpawnTable(floorId: LFloorId, rand: LRandom): LEntity | undefined {
        const table = floorId.landData().appearanceTable;
        if (table.traps.length == 0) return undefined;    // 出現テーブルが空
        const list = table.traps[floorId.floorNumber()];
        if (list.length == 0) return undefined;    // 出現テーブルが空

        const data = UEffect.selectRatingForce<DAppearanceTableEntity>(rand, list, 100, x => x.spawiInfo.rate);
        const entity = SEntityFactory.newEntity(data.spawiInfo, floorId);
        return entity;
    }

    public static createItemFromSpawnTableOrDefault(floorId: LFloorId, rand: LRandom): LEntity {
        const entity = this.createItemFromSpawnTable(floorId, rand);
        if (entity) return entity;
        return SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.system.fallbackItemEntityId), floorId);
    }

}
