
import { MRData } from "ts/re/data/MRData";
import { DLand, DLandId } from "ts/re/data/DLand";
import { MRSerializable } from "../Common";

@MRSerializable
export class LLand {
    private _landDataId: DLandId = 0;

    public setup_(landDataId: DLandId): void {
        this._landDataId = landDataId;
    }

    public landData(): DLand {
        return MRData.lands[this._landDataId];
    }

    public maxFloorNumber(): number {
        return this.landData().floorInfos.length - 1;
    }
}


