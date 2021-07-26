import { DBasics } from "ts/data/DBasics";
import { LMap } from "ts/objects/LMap";
import { LRandom } from "ts/objects/LRandom";
import { LMonsterHouseStructure } from "ts/objects/structures/LMonsterHouseStructure";
import { SMapManager } from "../SMapManager";

export class SMonsterHouseBuilder {
    public build(manager: SMapManager, info: LMonsterHouseStructure, rand: LRandom): void {
        const map = manager.map();
        const room = map.room(info.roomId());
        room.forEachBlocks(block => {
            if (rand.nextIntWithMax(100) < 75) {
                const entities = manager.spawnEnemy(block.x(), block.y());
                for (const entity of entities) {
                    entity.addState(DBasics.states.nap);
                }
            }
        });
    }
}
