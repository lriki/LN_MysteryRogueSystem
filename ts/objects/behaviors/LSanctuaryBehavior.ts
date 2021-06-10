import { DItem, DItemDataId } from "ts/data/DItem";
import { REData } from "ts/data/REData";
import { REResponse } from "ts/system/RECommand";
import { RESystem } from "ts/system/RESystem";
import { SCommandContext } from "ts/system/SCommandContext";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, onWalkedOnTopReaction } from "./LBehavior";


/**
 * 
 */
export class LSanctuaryBehavior extends LBehavior {


    public constructor() {
        super();
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LSanctuaryBehavior);
        return b;
    }

    
    [onWalkedOnTopReaction](e: CommandArgs, context: SCommandContext): REResponse {
        const target = e.sender;


        
        return REResponse.Pass;
    }

}

