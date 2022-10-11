import { MRSerializable } from "ts/mr/Common";
import { LEntity } from "../LEntity";
import { MRLively } from "../MRLively";
import { LBehavior } from "./LBehavior";


/**
 * 
 */
@MRSerializable
export class LStorageBehavior extends LBehavior {


    public constructor() {
        super();
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LStorageBehavior);
        return b;
    }

    

}

