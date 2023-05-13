import { MRSerializable } from "../Common";
import { USearch } from "../utility/USearch";
import { LEntity } from "./entity/LEntity";

@MRSerializable
export class LFov {

    /**
     * 指定した Entity が、視界に入っているかどうか判断します。
     * @param target 
     */
    public testTargetVisible(self: LEntity, target: LEntity): boolean {
        if (USearch.hasBlindness(self)) return false;

        return USearch.checkInSightEntity(self, target);
    }
}

