import { REData } from "ts/data/REData";
import { REGame } from "ts/objects/REGame";
import { DecisionPhase } from "ts/objects/behaviors/LBehavior";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { LStateBehavior } from "./LStateBehavior";
import { DBasics } from "ts/data/DBasics";

// deprecated
export class LDebugMoveRightState extends LStateBehavior {

    onDecisionPhase(entity: REGame_Entity, context: RECommandContext, phase: DecisionPhase): REResponse {
        
        if (phase == DecisionPhase.AIMinor) {
            // 右へ移動するだけ
            let dir = 6;

            // ランダム移動
            //const table = [1,2,3,4,6,7,8,9];
            //const dir = table[REGame.world.random().nextIntWithMax(8)];


            if (dir != 0 && REGame.map.checkPassage(entity, dir)) {
                context.postActionTwoWay(DBasics.actions.DirectionChangeActionId, entity, undefined, { direction: dir });
                context.postActionTwoWay(DBasics.actions.MoveToAdjacentActionId, entity, undefined, { direction: dir });
            }
            context.postConsumeActionToken(entity);
            return REResponse.Succeeded;
        }

        return super.onDecisionPhase(entity, context, phase);
    }
}
