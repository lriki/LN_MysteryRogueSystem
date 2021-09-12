import { SPhaseResult } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { DecisionPhase, LBehavior } from "../behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { LCharacterAI } from "../ai/LCharacterAI";
import { LEscapeAI } from "../ai/LEscapeAI";

export class LIllusionStateBehavior extends LBehavior {
    private _characterAI: LCharacterAI;
    
    constructor() {
        super();
        this._characterAI = new LEscapeAI();
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LIllusionStateBehavior);
        b._characterAI = this._characterAI.clone();
        return b
    }
    
    onDecisionPhase(entity: LEntity, context: SCommandContext, phase: DecisionPhase): SPhaseResult {
        if (this._characterAI) {
            if (phase == DecisionPhase.AIMinor) {
                return this._characterAI.thinkMoving(context, entity);
            }
            else if (phase == DecisionPhase.AIMajor) {
                return this._characterAI.thinkAction(context, entity);
            }
        }

        
        return SPhaseResult.Pass;
    }
}