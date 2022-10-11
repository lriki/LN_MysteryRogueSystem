import { MRSerializable } from "ts/mr/Common";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { LEscapeAI } from "../ai/LEscapeAI";
import { DecisionPhase, LBehavior, LBehaviorGroup } from "../internal";
import { LEntity } from "../LEntity";
import { MRLively } from "../MRLively";


/**
 */
@MRSerializable
export class LEscapeBehavior extends LBehavior {
    private _escapeAI: LEscapeAI;
    
    public constructor() {
        super();
        this._escapeAI = new LEscapeAI();
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LEscapeBehavior);
        return b;
    }

    behaviorGroup(): LBehaviorGroup {
        return LBehaviorGroup.SpecialAbility;
    }
    
    onDecisionPhase(self: LEntity, cctx: SCommandContext, phase: DecisionPhase): SPhaseResult {
        if (phase == DecisionPhase.AIMinor) {
            this._escapeAI.thinkMoving(cctx, self);
            return SPhaseResult.Handled;
        }
        else if (phase == DecisionPhase.AIMajor) {
            this._escapeAI.thinkAction(cctx, self);
            return SPhaseResult.Handled;
        }
        return SPhaseResult.Pass;
    }
}

