import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DMonsterHouseTypeId } from "ts/data/DMonsterHouse";
import { DFactionId, REData } from "ts/data/REData";
import { FRoom } from "ts/floorgen/FMapData";
import { SCommandContext } from "ts/system/SCommandContext";
import { REGame } from "./REGame";
import { LBlock, TileShape } from "./LBlock";
import { LEntity } from "./LEntity";
import { DFloorInfo, DLand, DLandId } from "ts/data/DLand";

export class LLand {
    private _landDataId: DLandId = 0;

    public setup_(landDataId: DLandId): void {
        this._landDataId = landDataId;
    }

    public landData(): DLand {
        return REData.lands[this._landDataId];
    }

    public maxFloorNumber(): number {
        return this.landData().floorInfos.length - 1;
    }
}


