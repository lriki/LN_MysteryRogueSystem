import { RESerializable, tr2 } from "ts/re/Common";
import { MRBasics } from "ts/re/data/MRBasics";
import { SCommandResponse } from "ts/re/system/SCommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { UName } from "ts/re/usecases/UName";
import { LActivity } from "../activities/LActivity";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, onGrounded, testPickOutItem } from "./LBehavior";

/**
 * 置くと床に張り付く
 */
@RESerializable
export class LGlueToGroundBehavior extends LBehavior {

    private _glued: boolean = false;

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LGlueToGroundBehavior);
        throw new Error("Not implemented.");
    }

    public get glued(): boolean {
        return this._glued;
    }
    
    public set glued(value: boolean) {
        this._glued = value;
    }

    onActivityPreReaction(self: LEntity, cctx: SCommandContext, activity: LActivity): SCommandResponse {
        if (activity.actionId() == MRBasics.actions.PickActionId) {
            if (this._glued) {
                cctx.postMessage(tr2("%1は地面にはりついている。").format(UName.makeNameAsItem(self)));
                return SCommandResponse.Canceled;
            }
        }
        return SCommandResponse.Pass;
    }

    [testPickOutItem](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
        const self = args.self;
        if (this._glued) {
            cctx.postMessage(tr2("%1は地面にはりついている。").format(UName.makeNameAsItem(self)));
            return SCommandResponse.Canceled;
        }
        else {
            return SCommandResponse.Pass;
        }
    }

    [onGrounded](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
        this._glued = true;
        return SCommandResponse.Pass;
    }
    
}
