
import { LBehavior } from "../behaviors/LBehavior";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { RESerializable } from "ts/re/Common";
import { DBlockLayerKind } from "ts/re/data/DCommon";

@RESerializable
export class LItemStandingBehavior extends LBehavior {
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LItemStandingBehavior);
        return b;
    }
    
    queryHomeLayer(): DBlockLayerKind | undefined {
        return DBlockLayerKind.Unit;
    }



}