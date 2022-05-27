import { RESerializable, tr2 } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LActivity } from "../activities/LActivity";
import { LEntity } from "../LEntity";
import { LFieldEffect, LSanctuaryFieldEffect } from "../LFieldEffect";
import { REGame } from "../REGame";
import { LBehavior } from "./LBehavior";
import { LGlueToGroundBehavior } from "./LGlueToGroundBehavior";

/**
 */
@RESerializable
export class LSanctuaryBehavior extends LBehavior {
    private _fieldEffect: LSanctuaryFieldEffect | undefined;

    public constructor() {
        super();
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LSanctuaryBehavior);
        return b;
    }

    onAttached(self: LEntity): void {
        this._fieldEffect = new LSanctuaryFieldEffect(self);
    }

    onDetached(self: LEntity): void {
        this._fieldEffect = undefined;
    }

    onActivityReaction(self: LEntity, cctx: SCommandContext, activity: LActivity): SCommandResponse {
        if (activity.actionId() == REBasics.actions.ReadActionId) {
            cctx.postMessage(tr2("しかしなにもおこらなかった。"));
        }
        return SCommandResponse.Pass;
    }
    
    *onCollectFieldEffect(self: LEntity): Generator<LFieldEffect, void, unknown> {
        const glue = self.getEntityBehavior(LGlueToGroundBehavior);
        if (glue.glued && this._fieldEffect) {
            yield this._fieldEffect;
        }
    }
}

