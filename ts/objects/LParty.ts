import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DMonsterHouseId } from "ts/data/DMonsterHouse";
import { DFactionId, REData } from "ts/data/REData";
import { FRoom } from "ts/floorgen/FMapData";
import { SCommandContext } from "ts/system/SCommandContext";
import { REGame } from "./REGame";
import { LBlock, TileShape } from "./LBlock";
import { LEntity } from "./LEntity";
import { DFloorInfo, DLand, DLandId } from "ts/data/DLand";
import { LEntityId } from "./LObject";

export type LPartyId = number;

/**
 * 仲間キャラや、グループで動くモンスターをまとめる仕組み。
 * RMMZ の Party と Troop を合わせたようなもの。
 * member がいなくなると、GC される。
 */
export class LParty {
    private _id: LPartyId = 0;
    private _members: LEntityId[] = [];

    public setup(id: LPartyId) {
        this._id = id;
    }

    public id(): LPartyId {
        return this._id;
    }

    public isEmpty(): boolean {
        return this._members.length == 0;
    }

    public addMember(entity: LEntity): void {
        assert(entity.partyId() == 0);
        this._members.push(entity.entityId());
    }

    public removeMember(entity: LEntity): void {
        assert(entity.partyId() == this._id);
        this._members.mutableRemove(e => e.equals(entity.entityId()));
    }
}


