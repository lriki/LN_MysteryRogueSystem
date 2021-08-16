import { DBasics } from "ts/data/DBasics";
import { LBlockSystemDecoration } from "ts/objects/LBlock";
import { LMap } from "ts/objects/LMap";
import { LRandom } from "ts/objects/LRandom";
import { LItemShopStructure } from "ts/objects/structures/LItemShopStructure";
import { USpawner } from "ts/usecases/USpawner";
import { SMapManager } from "../SMapManager";

export class SItemShopBuilder {
    public build(manager: SMapManager, info: LItemShopStructure, rand: LRandom): void {
        const map = manager.map();
        const room = map.room(info.roomId());
        
        room.forEachBlocks(block => {
            block.setSystemDecoration(LBlockSystemDecoration.ItemShop);
            USpawner.spawnSingleEntity("kEnemy_店主", block.x(), block.y());

            /*
            // Enemy
            if (rand.nextIntWithMax(100) < 50) {
                const entities = manager.spawnEnemy(block.x(), block.y());
                for (const entity of entities) {
                    entity.addState(DBasics.states.nap);
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
            */
        });
    }
}
