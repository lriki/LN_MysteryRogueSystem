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
@RESerializable
export class LClingFloorBehavior extends LBehavior {

    private _cling: boolean = false;

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LClingFloorBehavior);
        throw new Error("Not implemented.");
        return b
    }

    
    [testPickOutItem](args: CommandArgs, context: SCommandContext): SCommandResponse {
        const self = args.self;
        if (this._cling) {
            context.postMessage(tr2("%1 地面にはりついている。").format(UName.makeNameAsItem(self)));
            return SCommandResponse.Canceled;
        }
        else {
            return SCommandResponse.Pass;
        }
    }

    [onGrounded](args: CommandArgs, context: SCommandContext): SCommandResponse {
        this._cling = true;
        return SCommandResponse.Pass;
    }
    
}
