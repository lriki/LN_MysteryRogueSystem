import { LEntity } from "../entity/LEntity";
import { MRLively } from "../MRLively";
import { LBehavior } from "./LBehavior";




/**
 * @deprecated
 */
export class LItemUserBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LItemUserBehavior);
        return b;
    }

}

