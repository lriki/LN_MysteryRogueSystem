import { SCommandContext } from "ts/system/SCommandContext";
import { REGame } from "../REGame";
import { LRoomId } from "../LBlock";
import { LEntity } from "../LEntity";
import { LStructure } from "./LStructure";
import { DItemShopTypeId } from "ts/data/DItemShop";

export class LItemShopStructure extends LStructure {
    private _roomId: LRoomId = 0;
    private _itemShopTypeId: DItemShopTypeId = 0;
    //private _monsterHouseState: MonsterHouseState = MonsterHouseState.Sleeping;

    public setup(roomId: LRoomId, itemShopTypeId: DItemShopTypeId): void {
        this._roomId = roomId;
        this._itemShopTypeId = itemShopTypeId;
        console.log("ItemShop!");
    }

    public roomId(): LRoomId {
        return this._roomId;
    }

    public itemShopTypeId(): DItemShopTypeId {
        return this._itemShopTypeId;
    }

    onEntityLocated(context: SCommandContext, entity: LEntity): void {
        const block = REGame.map.block(entity.x, entity.y);
        if (block._roomId == this._roomId) {
        }
    }
}
