
import { MRData } from "ts/mr/data/MRData";
import { DLand } from "ts/mr/data/DLand";
import { MRSerializable } from "../Common";
import { DLandId } from "../data/DCommon";
import { LIdentifyer } from "./LIdentifyer";

@MRSerializable
export class LLand {
    public readonly identifyer: LIdentifyer;
    private _landDataId: DLandId = 0;

    public constructor(landDataId: DLand) {
        this.identifyer = new LIdentifyer();
        this._landDataId = landDataId.id;
    }

    public landData(): DLand {
        return MRData.lands[this._landDataId];
    }

    public maxFloorNumber(): number {
        return this.landData().floorInfos.length - 1;
    }

    public resetIdentifyer(): void {
        this.identifyer.reset(this.landData());
    }
}


