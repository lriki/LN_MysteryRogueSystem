import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { LBehavior } from "./LBehavior";


/**
 * 
 */
export class LStorageBehavior extends LBehavior {


    public constructor() {
        super();
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LStorageBehavior);
        return b;
    }

    

}

