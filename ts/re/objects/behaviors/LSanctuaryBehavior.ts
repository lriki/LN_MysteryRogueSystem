import { RESerializable } from "ts/re/Common";
import { DBasics } from "ts/re/data/DBasics";
import { REResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, onWalkedOnTopReaction } from "./LBehavior";
import { LEnemyBehavior } from "./LEnemyBehavior";


/**
 * 
 */
@RESerializable
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

        // 戦闘不能ステート 付加
        if (target.findEntityBehavior(LEnemyBehavior)) {
            target.addState(DBasics.states.dead);
        }
        
        return REResponse.Pass;
    }

}

