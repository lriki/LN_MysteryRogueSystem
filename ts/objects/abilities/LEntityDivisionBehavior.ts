import { REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { LProjectableBehavior } from "../behaviors/activities/LProjectableBehavior";
import { CollideActionArgs, CommandArgs, LBehavior, onCollideAction, onDirectAttackDamaged } from "../behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";


export class LEntityDivisionBehavior extends LBehavior {
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LEntityDivisionBehavior);
        return b
    }

    [onDirectAttackDamaged](args: CommandArgs, context: SCommandContext): REResponse {
        const self = args.self;

        

        return REResponse.Pass;
    }

}

