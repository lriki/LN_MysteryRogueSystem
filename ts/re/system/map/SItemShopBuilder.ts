import { LBlockSystemDecoration } from "ts/re/objects/LBlock";
import { LRandom } from "ts/re/objects/LRandom";
import { REGame } from "ts/re/objects/REGame";
import { LItemShopStructure } from "ts/re/objects/structures/LItemShopStructure";
import { UMovement } from "ts/re/usecases/UMovement";
import { USpawner } from "ts/re/usecases/USpawner";
import { SEntityFactory } from "../SEntityFactory";
import { SMapManager } from "../SMapManager";

export class SItemShopBuilder {
    public build(manager: SMapManager, info: LItemShopStructure, rand: LRandom): void {
        const map = manager.map();
        const room = map.room(info.roomId());
        
        room.forEachBlocks(block => {
            block.setSystemDecoration(LBlockSystemDecoration.ItemShop);
            //USpawner.spawnSingleEntity("kEnemy_店主", block.x(), block.y());

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

        const floorId = manager.map().floorId();
        const items = manager.map().land2().landData().appearanceTable.shop[floorId.floorNumber()].filter(e => e.spawiInfo.isItemKind());
        if (items.length > 0) {
            const center = UMovement.getCenterOfRoom(room);
            for (let my = center.y - 1; my <= center.y + 1; my++) {
                for (let mx = center.x - 1; mx <= center.x + 1; mx++) {
                    if (room.contains(mx, my)) {
                        const data = manager.rand().select(items);
                        const entity = SEntityFactory.newEntity(data.spawiInfo, floorId);
                        REGame.world._transferEntity(entity, floorId, mx, my);
                    }
                }
            }
        }
    }


    /*
    private getShopkeeperHomeBlock(doorway: LBlock): LBlock {
        assert(doorway.isDoorway());

        const adjacents = UBlock.adjacentBlocks4(REGame.map, doorway);
        const passageway = adjacents.filter(x => x.isPassageway() && x.isFloorLikeShape());

        // 店主の移動帯の向きは？
        let horizontal = false;
        let pair = [];
        if (passageway.length == 1 && (doorway.x() - passageway[0].x()) == 0) {
            horizontal = true;
            // ■通■
            // □□□

            const b1 = REGame.map.tryGetBlock(doorway.x() - 1, doorway.y());
            if (b1) pair.push(b1);
            const b2 = REGame.map.tryGetBlock(doorway.x() + 1, doorway.y());
            if (b2) pair.push(b2);
        }
        else {
            // 部屋の隅に通路が生成されている場合など、水平・垂直判断ができない場合は水平にしてみる
            horizontal = false;
            // □■
            // □通
            // □■

            const b1 = REGame.map.tryGetBlock(doorway.x(), doorway.y() - 1);
            if (b1) pair.push(b1);
            const b2 = REGame.map.tryGetBlock(doorway.x(), doorway.y() + 1);
            if (b2) pair.push(b2);
        }

        if (horizontal) {

        }

        for (const block of UBlock.getAdjacentBlocks8(REGame.map, doorway)) {

        }
    }
    */
    
}
