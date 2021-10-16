import { DParameterId } from "ts/re/data/DParameter";
import { SPhaseResult } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LEscapeAI } from "../ai/LEscapeAI";
import { DecisionPhase, LBehavior, LBehaviorGroup } from "../internal";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";


/**
 */
export class LEscapeBehavior extends LBehavior {
    private _escapeAI: LEscapeAI;
    
    public constructor() {
        super();
        this._escapeAI = new LEscapeAI();
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LEscapeBehavior);
        return b;
    }

    behaviorGroup(): LBehaviorGroup {
        return LBehaviorGroup.SpecialAbility;
    }
    
    onDecisionPhase(context: SCommandContext, self: LEntity, phase: DecisionPhase): SPhaseResult {
        if (phase == DecisionPhase.AIMinor) {
            this._escapeAI.thinkMoving(context, self);
            return SPhaseResult.Handled;
        }
        else if (phase == DecisionPhase.AIMajor) {
            this._escapeAI.thinkAction(context, self);
            return SPhaseResult.Handled;
        }
        return SPhaseResult.Pass;
    }
}

