import { assert } from "ts/re/Common";
import { DEntityKind } from "ts/re/data/DEntityKind";
import { LShopkeeperBehavior } from "ts/re/objects/behaviors/LShopkeeperBehavior";
import { LBlock, LBlockSystemDecoration } from "ts/re/objects/LBlock";
import { LRandom } from "ts/re/objects/LRandom";
import { LRoom } from "ts/re/objects/LRoom";
import { REGame } from "ts/re/objects/REGame";
import { LItemShopStructure } from "ts/re/objects/structures/LItemShopStructure";
import { UMovement } from "ts/re/usecases/UMovement";
import { USpawner } from "ts/re/usecases/USpawner";
import { SEntityFactory } from "../SEntityFactory";
import { SMapManager } from "../SMapManager";

interface Entrance {
    home: LBlock;
    gate: LBlock;
}

export class SItemShopBuilder {
    public build(manager: SMapManager, info: LItemShopStructure, rand: LRandom): void {
        const map = manager.map();
        const room = map.room(info.roomId());
        
        room.forEachBlocks(block => {
            block.setSystemDecoration(LBlockSystemDecoration.ItemShop);
            //USpawner.spawnSingleEntity("kEnemy_店主A", block.x(), block.y());

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

        // 店主配置
        const entrances = this.setupEntranceBlocks(room);
        for (const entrance of entrances) {
            const e = info.addShopEntrance(entrance.home.mx, entrance.home.my, entrance.gate.mx, entrance.gate.my);
            const entity = USpawner.spawnSingleEntity("kEnemy_店主A", entrance.home.mx, entrance.home.my);
            const behavior = entity.getEntityBehavior(LShopkeeperBehavior);
            behavior.setup( info.id(), e.index());
        }

        // アイテム配置
        const floorId = manager.map().floorId();
        const items = manager.map().land2().landData().appearanceTable.shop[floorId.floorNumber()].filter(e => DEntityKind.isItem(e.spawiInfo.entityData()));
        if (items.length > 0) {
            const spawnedItems = [];
            const center = UMovement.getCenterOfRoom(room);
            for (let my = center.y - 1; my <= center.y + 1; my++) {
                for (let mx = center.x - 1; mx <= center.x + 1; mx++) {
                    if (room.contains(mx, my)) {
                        const data = manager.rand().select(items);
                        const entity = SEntityFactory.newEntity(data.spawiInfo, floorId);
                        REGame.world._transferEntity(entity, floorId, mx, my);
                        spawnedItems.push(entity);

                        // 値札をつける
                        //entity._shopArticle._ownerShopStructureId = info.id();
                    }
                }
            }
            info.setInitialItems(spawnedItems);
        }
    }

    private setupEntranceBlocks(room: LRoom): Entrance[] {
        const result: Entrance[] = [];
        for (const block of room.doorwayBlocks()) {
            let block1: LBlock | undefined = undefined;
            let block2: LBlock | undefined = undefined;

            if (block.mx == room.mx1) {   // 部屋の左側
                block1 = this.getInRoomFloorBlock(room, block.mx, block.my - 1);
                block2 = this.getInRoomFloorBlock(room, block.mx, block.my + 1);
            }
            else if (block.mx == room.mx2) {   // 部屋の右側
                block1 = this.getInRoomFloorBlock(room, block.mx, block.my - 1);
                block2 = this.getInRoomFloorBlock(room, block.mx, block.my + 1);
            }
            else if (block.my == room.my1) {   // 部屋の上側
                block1 = this.getInRoomFloorBlock(room, block.mx - 1, block.my);
                block2 = this.getInRoomFloorBlock(room, block.mx + 1, block.my);
            }
            else if (block.my == room.my2) {   // 部屋の下側
                block1 = this.getInRoomFloorBlock(room, block.mx - 1, block.my);
                block2 = this.getInRoomFloorBlock(room, block.mx + 1, block.my);
            }
            
            assert(block1 || block2);
            block._shopkeeperLine = true;
            if (block1) block1._shopkeeperLine = true;
            if (block2) block2._shopkeeperLine = true;
            const home = block1 ?? block2;
            assert(home);
            result.push({
                home: home,
                gate: block,
            });
        }
        return result;
    }

    private getInRoomFloorBlock(room: LRoom, mx: number, my: number): LBlock | undefined {
        if (!room.contains(mx, my)) return undefined;
        const block = REGame.map.tryGetBlock(mx, my);
        if (!block) return undefined;
        if (!block.isFloorLikeShape()) return undefined;
        return block;
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
