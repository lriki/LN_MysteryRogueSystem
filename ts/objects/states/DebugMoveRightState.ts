import { REData } from "ts/data/REData";
import { REGame } from "ts/objects/REGame";
import { DecisionPhase } from "ts/objects/behaviors/LBehavior";
import { LEntity } from "ts/objects/LEntity";
import { REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { DBasics } from "ts/data/DBasics";
import { LStateTraitBehavior } from "./LStateTraitBehavior";
import { LDirectionChangeActivity } from "../activities/LDirectionChangeActivity";
import { LMoveAdjacentActivity } from "../activities/LMoveAdjacentActivity";

export class LDebugMoveRightState extends LStateTraitBehavior {

    onDecisionPhase(entity: LEntity, context: RECommandContext, phase: DecisionPhase): REResponse {
        
        if (phase == DecisionPhase.AIMinor) {
            // 右へ移動するだけ
            let dir = 6;

            // ランダム移動
            //const table = [1,2,3,4,6,7,8,9];
            //const dir = table[REGame.world.random().nextIntWithMax(8)];


            if (dir != 0 && REGame.map.checkPassage(entity, dir)) {
                context.postActivity(entity, LDirectionChangeActivity.make(entity, dir));
                context.postActivity(entity, LMoveAdjacentActivity.make(entity, dir));
            }
            context.postConsumeActionToken(entity);
            return REResponse.Succeeded;
        }

        return super.onDecisionPhase(entity, context, phase);
    }
}
