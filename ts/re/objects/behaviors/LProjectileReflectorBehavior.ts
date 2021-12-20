import { RESerializable, tr2 } from "ts/re/Common";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { UName } from "ts/re/usecases/UName";
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
