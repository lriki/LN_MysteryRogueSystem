import { REBasics } from "ts/re/data/REBasics";
import { LRandom } from "ts/re/objects/LRandom";
import { LMonsterHouseStructure } from "ts/re/objects/structures/LMonsterHouseStructure";
import { SMapManager } from "../SMapManager";

export class SMonsterHouseBuilder {
    public build(manager: SMapManager, info: LMonsterHouseStructure, rand: LRandom): void {
        const map = manager.map();
        const room = map.room(info.roomId());
        
        room.forEachBlocks(block => {

            // Enemy
            if (rand.nextIntWithMax(100) < 50) {
                const entities = manager.spawnEnemy(block.x(), block.y());
                for (const entity of entities) {
                    entity.addState(REBasics.states.nap);
                }
            }

            // Item & Trap
            const groundRD = 80;
            const rd = rand.nextIntWithMax(100);
            if (rd < groundRD) {
                if (rd < (groundRD / 2)) {
                    manager.spawnItem(block.x(), block.y());
                }
                else {
                    manager.spawnTrap(block.x(), block.y());
                }
            }
        });
    }
}
