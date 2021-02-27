import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { RoomEventArgs } from "ts/data/predefineds/DBasicEvents";
import { LUnitAttribute } from "ts/objects/attributes/LUnitAttribute";
import { testPutInItem } from "ts/objects/behaviors/LBehavior";
import { MonsterHouseState } from "ts/objects/LRoom";
import { REGame } from "ts/objects/REGame";
import { BlockLayerKind, REGame_Block } from "ts/objects/REGame_Block";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { REGame_Map } from "ts/objects/REGame_Map";
import { Helpers } from "./Helpers";
import { RECommandContext } from "./RECommandContext";


export class SMomementCommon {
    public static moveEntity(context: RECommandContext, entity: REGame_Entity, x: number, y: number, toLayer: BlockLayerKind): boolean {
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
    
    private static _postLocate(context: RECommandContext, entity: REGame_Entity, oldBlock: REGame_Block, newBlock: REGame_Block, map: REGame_Map) {
        if (oldBlock._roomId != newBlock._roomId) {
            const args: RoomEventArgs = {
                entity: entity,
                newRoomId: newBlock._roomId,
                oldRoomId: oldBlock._roomId,
            };
        
            /*
            const newRoom = map.rooms()[newBlock._roomId];
            if (newRoom.monsterHouseTypeId() > 0) {
                const attr = entity.findAttribute(LUnitAttribute);
                // モンスターハウスから見て、侵入してきた entity が敵対関係にあれば、起動する
                if (attr &&
                    Helpers.isHostileFactionId(newRoom.monsterHouseFactionId(), attr.factionId()) &&
                    newRoom.monsterHouseState() == MonsterHouseState.Sleeping) {
                    newRoom.startMonsterHouse(context);
                }
            }
            */

            entity._located = true;

            REGame.eventServer.send(DBasics.events.roomEnterd, args);
            REGame.eventServer.send(DBasics.events.roomLeaved, args);
        }
    }
}
