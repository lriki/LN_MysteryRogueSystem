import { MRSerializable } from "ts/mr/Common";
import { LBehavior } from "../behaviors/LBehavior";
import { LEntity } from "../entity/LEntity";
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

