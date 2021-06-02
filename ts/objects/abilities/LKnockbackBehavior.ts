import { REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { LProjectableBehavior } from "../behaviors/activities/LProjectableBehavior";
import { CollideActionArgs, CommandArgs, LBehavior, onCollideAction } from "../behaviors/LBehavior";
import { LCommonBehavior } from "../behaviors/LCommonBehavior";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";


export class LKnockbackBehavior extends LBehavior {
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LKnockbackBehavior);
        return b
    }

    [onCollideAction](args: CommandArgs, context: SCommandContext): REResponse {
        
        const a = args.args as CollideActionArgs;

        LProjectableBehavior.startMoveAsProjectile(context, args.sender, args.subject, a.dir, 10);
        
        return REResponse.Pass;
    }
}

