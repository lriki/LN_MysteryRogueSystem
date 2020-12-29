import { REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { DecisionPhase } from "../behaviors/LBehavior";
import { REGame_Entity } from "../REGame_Entity";
import { LStateTraitBehavior } from "./LStateTraitBehavior";

export class LStateTrait_Nap extends LStateTraitBehavior {
    
    onDecisionPhase(entity: REGame_Entity, context: RECommandContext, phase: DecisionPhase): REResponse {
        // Skip action
        context.postConsumeActionToken(entity);
        return REResponse.Succeeded;
    }
}
