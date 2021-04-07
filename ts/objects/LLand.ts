import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DMonsterHouseId } from "ts/data/DMonsterHouse";
import { DFactionId, REData } from "ts/data/REData";
import { FRoom } from "ts/floorgen/FMapData";
import { RECommandContext } from "ts/system/RECommandContext";
import { REGame } from "./REGame";
import { REGame_Block, TileKind } from "./REGame_Block";
import { LEntity } from "./LEntity";
import { DFloorInfo, DLand, DLandId } from "ts/data/DLand";

export class LLand {
    private _landDataId: DLandId = 0;

    public setup_(landDataId: DLandId): void {
        this._landDataId = landDataId;
    }
}


