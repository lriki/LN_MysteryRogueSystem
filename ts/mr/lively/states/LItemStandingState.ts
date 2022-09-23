
import { LBehavior } from "../behaviors/LBehavior";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { MRSerializable } from "ts/mr/Common";
import { DBlockLayerKind } from "ts/mr/data/DCommon";

@MRSerializable
export class LItemStandingBehavior extends LBehavior {
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LItemStandingBehavior);
        return b;
    }
    
    queryHomeLayer(): DBlockLayerKind | undefined {
        return DBlockLayerKind.Unit;
    }



}
