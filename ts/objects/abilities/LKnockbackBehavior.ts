import { REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { CollideActionArgs, CommandArgs, LBehavior, onCollideAction } from "../behaviors/LBehavior";
import { LCommonBehavior } from "../behaviors/LCommonBehavior";


export class LKnockbackBehavior extends LBehavior {
    
    [onCollideAction](args: CommandArgs, context: RECommandContext): REResponse {
        
        const a = args.args as CollideActionArgs;

        console.log("startMoveAsProjectile", args);

        LCommonBehavior.startMoveAsProjectile(context, args.sender, a.dir, 5);
        
        return REResponse.Pass;
    }
}

