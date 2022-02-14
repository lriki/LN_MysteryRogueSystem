import { REBasics } from "ts/re/data/REBasics";
import { LRandom } from "ts/re/objects/LRandom";
import { LMonsterHouseStructure } from "ts/re/objects/structures/LMonsterHouseStructure";
import { paramMonsterHouseEnemiesMax, paramMonsterHouseEnemiesMin, paramMonsterHouseItemsMax, paramMonsterHouseItemsMin } from "ts/re/PluginParameters";
import { SMapManager } from "../SMapManager";

export class SMonsterHouseBuilder {
    public build(manager: SMapManager, info: LMonsterHouseStructure, rand: LRandom): void {
        const map = manager.map();
        const room = map.room(info.roomId());
        const blockCount = room.width + room.height;

        // Enemy
        const enemyCount = rand.nextIntWithMinMax(paramMonsterHouseEnemiesMin, paramMonsterHouseEnemiesMax + 1);
        for (let i = 0; i < enemyCount; i++) {
            const id = rand.nextIntWithMax(blockCount);
            const x = Math.floor(id % room.width);
            const y = Math.floor(id / room.height);
            const entities = manager.spawnEnemy(x, y);
            for (const entity of entities) {
                entity.addState(REBasics.states.nap);
            }
        }

        // Item & Trap
        const itemCount = rand.nextIntWithMinMax(paramMonsterHouseItemsMin, paramMonsterHouseItemsMax + 1);
        for (let i = 0; i < itemCount; i++) {
            const id = rand.nextIntWithMax(blockCount);
            const x = Math.floor(id % room.width);
            const y = Math.floor(id / room.height);

            const groundRD = 80;
            const rd = rand.nextIntWithMax(100);
            if (rd < groundRD) {
                if (rd < (groundRD / 2)) {
                    manager.spawnItem(x, y);
                }
                else {
                    manager.spawnTrap(x, y);
                }
            }
        }
    }
}
