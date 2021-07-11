import { DBasics } from "ts/data/DBasics";
import { REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, onWalkedOnTopReaction } from "./LBehavior";
import { LEnemyBehavior } from "./LEnemyBehavior";


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

