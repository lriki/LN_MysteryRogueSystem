import { REGame } from "ts/objects/REGame";
import { DecisionPhase, LBehavior } from "ts/objects/behaviors/LBehavior";
import { LEntity } from "ts/objects/LEntity";
import { SPhaseResult } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { LDirectionChangeActivity } from "../activities/LDirectionChangeActivity";
import { LMoveAdjacentActivity } from "../activities/LMoveAdjacentActivity";

export class LDebugMoveRightState extends LBehavior {

    onDecisionPhase(entity: LEntity, context: SCommandContext, phase: DecisionPhase): SPhaseResult {
        
        if (phase == DecisionPhase.AIMinor) {
            // 右へ移動するだけ
            let dir = 6;

            // ランダム移動
            //const table = [1,2,3,4,6,7,8,9];
            //const dir = table[REGame.world.random().nextIntWithMax(8)];


            if (dir != 0 && REGame.map.checkPassage(entity, dir)) {
                context.postActivity(LDirectionChangeActivity.make(entity, dir));
                context.postActivity(LMoveAdjacentActivity.make(entity, dir));
            }
            context.postConsumeActionToken(entity);
            return SPhaseResult.Handled;
        }

        return super.onDecisionPhase(entity, context, phase);
    }
}
