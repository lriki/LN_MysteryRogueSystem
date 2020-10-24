import { assert } from "../Common";
import { REResponse } from "../RE/RECommand";
import { RECommandContext } from "../RE/RECommandContext";
import { DecisionPhase, REGame_Behavior } from "../RE/REGame_Behavior";

export class REGame_DecisionBehavior extends REGame_Behavior
{
    onDecisionPhase(context: RECommandContext, phase: DecisionPhase): REResponse {
        console.log("onDecisionPhase");
        assert(0);
        return REResponse.Pass;
    }

}
