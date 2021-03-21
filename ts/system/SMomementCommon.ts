import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { RoomEventArgs } from "ts/data/predefineds/DBasicEvents";
import { LUnitAttribute } from "ts/objects/attributes/LUnitAttribute";
import { testPutInItem } from "ts/objects/behaviors/LBehavior";
import { eqaulsEntityId } from "ts/objects/LObject";
import { MonsterHouseState } from "ts/objects/LRoom";
import { REGame } from "ts/objects/REGame";
import { BlockLayerKind, REGame_Block } from "ts/objects/REGame_Block";
import { LEntity } from "ts/objects/LEntity";
import { REGame_Map } from "ts/objects/REGame_Map";
import { Helpers } from "./Helpers";
import { RECommandContext } from "./RECommandContext";
import { RESystem } from "./RESystem";


export class SMomementCommon {
    public static moveEntity(context: RECommandContext, entity: LEntity, x: number, y: number, toLayer: BlockLayerKind): boolean {
        const map = REGame.map;
        assert(entity.floorId == map.floorId());

        if (!map.isValidPosition(x, y)) {
            return false;   // マップ外への移動
        }
        
        const oldBlock = map.block(entity.x, entity.y);
        const newBlock = map.block(x, y);

        if (map.canLeaving(oldBlock, entity) && map.canEntering(newBlock, toLayer)) {
            oldBlock.removeEntity(entity);
            entity.x = x;
            entity.y = y;
            newBlock.addEntity(toLayer, entity);
            this._postLocate(context, entity, oldBlock, newBlock, map);
            return true;
        }
        else {
            return false;
        }
    }
    
    private static _postLocate(context: RECommandContext, entity: LEntity, oldBlock: REGame_Block, newBlock: REGame_Block, map: REGame_Map) {
        if (eqaulsEntityId(REGame.camera.focusedEntityId(), entity.entityId())) {
            this.markPassed(map, newBlock);
        }

        if (oldBlock._roomId != newBlock._roomId) {
            const args: RoomEventArgs = {
                entity: entity,
                newRoomId: newBlock._roomId,
                oldRoomId: oldBlock._roomId,
            };
        
            REGame.eventServer.send(DBasics.events.roomEnterd, args);
            REGame.eventServer.send(DBasics.events.roomLeaved, args);
        }

        entity._located = true;
    }

    private static adjacentOffsets: number[][] = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1],
    ];

    private static markPassed(map: REGame_Map, block: REGame_Block): void {
        block._passed = true;
        if (block._roomId > 0) {
            const room = map.room(block._roomId);
            room.forEachBlocks(b => b._passed = true);
            room.forEachEdgeBlocks(b => b._passed = true);
        }
        else {
            this.adjacentOffsets.forEach(offset => {
                const x = block.x() + offset[0];
                const y = block.y() + offset[1];
                if (map.isValidPosition(x, y)) {
                    map.block(x, y)._passed = true;
                }
            });
        }
        REGame.minimapData.setRefreshNeeded();
    }
}
