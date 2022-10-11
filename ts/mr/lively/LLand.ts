
import { MRData } from "ts/mr/data/MRData";
import { DLand } from "ts/mr/data/DLand";
import { MRSerializable } from "../Common";
import { DLandId } from "../data/DCommon";

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


