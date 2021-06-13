import { tr2 } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { REResponse, SPhaseResult } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { LBattlerBehavior } from "./LBattlerBehavior";
import { CommandArgs, DecisionPhase, LBehavior, onGrounded, testPickOutItem } from "./LBehavior";

/**
 * 
 */
export class LClingFloorBehavior extends LBehavior {

    private _cling: boolean = false;

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LClingFloorBehavior);
        throw new Error("Not implemented.");
        return b
    }

    
    [testPickOutItem](args: CommandArgs, context: SCommandContext): REResponse {
        const self = args.self;
        if (this._cling) {
            context.postMessage(tr2("%1 地面にはりついている。").format(REGame.identifyer.makeDisplayText(self)));
            return REResponse.Canceled;
        }
        else {
            return REResponse.Pass;
        }
    }

    [onGrounded](args: CommandArgs, context: SCommandContext): REResponse {
        this._cling = true;
        return REResponse.Pass;
    }
    
}
