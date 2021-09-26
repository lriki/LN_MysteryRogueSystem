import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { LBehavior } from "./LBehavior";




/**
 * 
 */
export class LItemUserBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LItemUserBehavior);
        return b;
    }

}

