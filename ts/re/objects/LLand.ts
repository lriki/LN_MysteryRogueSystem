
import { REData } from "ts/re/data/REData";
import { DLand, DLandId } from "ts/re/data/DLand";

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


