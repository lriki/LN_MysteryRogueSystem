import { DMonsterHouseTypeId } from "ts/data/DMonsterHouse";
import { FRoomId } from "./FMapData";

export class FStructure {
}


export class FMonsterHouseStructure extends FStructure {
    private _roomId: FRoomId;
    private _monsterHouseTypeId: DMonsterHouseTypeId;   // リージョンを使って MH をマークするために用意したもの。MH である Block をひとつでも含む Room は MH となる。
    
    constructor(roomId: FRoomId, monsterHouseId: DMonsterHouseTypeId) {
        super();
        this._roomId = roomId;
        this._monsterHouseTypeId = monsterHouseId;
    }

    public roomId(): FRoomId{
        return this._roomId;
    }
    
    public setMonsterHouseTypeId(value: DMonsterHouseTypeId): void {
        this._monsterHouseTypeId = value;
    }

    public monsterHouseTypeId(): DMonsterHouseTypeId {
        return this._monsterHouseTypeId;
    }
}

