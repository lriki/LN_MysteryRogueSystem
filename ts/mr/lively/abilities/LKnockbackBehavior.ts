import { MRSerializable } from "ts/mr/Common";
import { SCommandResponse } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { LProjectileBehavior } from "../behaviors/activities/LProjectileBehavior";
import { CollideActionArgs, CommandArgs, LBehavior, onCollideAction } from "../behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { MRLively } from "../MRLively";


@MRSerializable
export class LKnockbackBehavior extends LBehavior {
    
    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LKnockbackBehavior);
        return b
    }

    // [onCollideAction](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
        
    //     const a = args.args as CollideActionArgs;

    //     LProjectableBehavior.startMoveAsProjectile(cctx, args.sender, args.subject, a.dir, 10);
        
    //     return SCommandResponse.Pass;
    // }
}

