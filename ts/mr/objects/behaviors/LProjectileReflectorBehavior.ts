import { MRSerializable, tr2 } from "ts/mr/Common";
import { SCommandResponse } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { UName } from "ts/mr/usecases/UName";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, onGrounded, testPickOutItem } from "./LBehavior";

/**
 * 
 */
// @RESerializable
// export class LProjectileReflectorBehavior extends LBehavior {
//     public clone(newOwner: LEntity): LBehavior {
//         const b = REGame.world.spawn(LProjectileReflectorBehavior);
//         return b;
//     }

    
//     [testPickOutItem](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
//         const self = args.self;
//         if (this._cling) {
//             cctx.postMessage(tr2("%1 地面にはりついている。").format(UName.makeNameAsItem(self)));
//             return SCommandResponse.Canceled;
//         }
//         else {
//             return SCommandResponse.Pass;
//         }
//     }

//     [onGrounded](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
//         this._cling = true;
//         return SCommandResponse.Pass;
//     }
    
// }
