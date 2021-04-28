import { REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { LProjectableBehavior } from "../behaviors/activities/LProjectableBehavior";
import { CollideActionArgs, CommandArgs, LBehavior, onCollideAction } from "../behaviors/LBehavior";
import { LCommonBehavior } from "../behaviors/LCommonBehavior";


export class LKnockbackBehavior extends LBehavior {
    
    [onCollideAction](args: CommandArgs, context: SCommandContext): REResponse {
        
        const a = args.args as CollideActionArgs;

        console.log("startMoveAsProjectile", args);

        LProjectableBehavior.startMoveAsProjectile(context, args.sender, a.dir, 5);
        
        return REResponse.Pass;
    }
}

