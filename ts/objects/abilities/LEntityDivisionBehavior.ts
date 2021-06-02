import { REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { LProjectableBehavior } from "../behaviors/activities/LProjectableBehavior";
import { CollideActionArgs, CommandArgs, LBehavior, onCollideAction, onDirectAttackDamaged } from "../behaviors/LBehavior";


export class LEntityDivisionBehavior extends LBehavior {
    
    [onDirectAttackDamaged](args: CommandArgs, context: SCommandContext): REResponse {
        const self = args.self;

        

        return REResponse.Pass;
    }

}

