import { MRSerializable, tr2 } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import { SCommand, SCommandResponse, STestTakeItemCommand } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { UName } from "ts/mr/utility/UName";
import { LActivity } from "../activities/LActivity";
import { LEntity } from "../entity/LEntity";
import { MRLively } from "../MRLively";
import { CommandArgs, LBehavior, onGrounded } from "./LBehavior";
import { SSubTaskChain, STaskYieldResult } from "ts/mr/system/tasks/STask";

/**
 * 置くと床に張り付く
 */
@MRSerializable
export class LGlueToGroundBehavior extends LBehavior {

    private _glued: boolean = false;

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LGlueToGroundBehavior);
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

    [onGrounded](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
        this._glued = true;
        return SCommandResponse.Pass;
    }
    
    override *onCommand(self: LEntity, cctx: SCommandContext, cmd: SCommand): Generator<STaskYieldResult> {
        if (cmd instanceof STestTakeItemCommand) {
            if (this._glued) {
                cctx.postMessage(tr2("%1は地面にはりついている。").format(UName.makeNameAsItem(self)));
                return STaskYieldResult.Reject;
            }
        }
    }
}
