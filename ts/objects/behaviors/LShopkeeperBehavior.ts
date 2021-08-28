
import { LBehavior } from "./LBehavior";
import { LEntity } from "ts/objects/LEntity";
import { REGame } from "ts/objects/REGame";


/**
 */
export class LShopkeeperBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LShopkeeperBehavior);
        return b;
    }


}
