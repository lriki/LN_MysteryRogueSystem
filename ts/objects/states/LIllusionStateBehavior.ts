import { SPhaseResult } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { RESystem } from "ts/system/RESystem";
import { DecisionPhase, LBehavior } from "../behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { LState } from "./LState";
import { DAutoRemovalTiming, DState, DStateId, DStateRestriction } from "ts/data/DState";
import { assert } from "ts/Common";
import { LDecisionBehavior } from "../behaviors/LDecisionBehavior";
import { REGame } from "../REGame";
import { LConfusionAI } from "../ai/LConfusionAI";
import { LActivity } from "../activities/LActivity";
import { LUnitBehavior } from "../behaviors/LUnitBehavior";
import { DBasics } from "ts/data/DBasics";
import { UMovement } from "ts/usecases/UMovement";
import { DParameterId } from "ts/data/DParameter";
import { LBlindAI } from "../ai/LBlindAI";
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
