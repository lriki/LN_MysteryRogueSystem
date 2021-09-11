import { REGame } from "ts/re/objects/REGame";
import { DecisionPhase, LBehavior } from "ts/re/objects/behaviors/LBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { SPhaseResult } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { MovingMethod } from "../LMap";
import { LActivity } from "../activities/LActivity";

export class LDebugMoveRightState extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LDebugMoveRightState);
        return b
    }

    onDecisionPhase(entity: LEntity, context: SCommandContext, phase: DecisionPhase): SPhaseResult {
        
        if (phase == DecisionPhase.AIMinor) {
            // 右へ移動するだけ
            let dir = 6;

            // ランダム移動
            //const table = [1,2,3,4,6,7,8,9];
            //const dir = table[REGame.world.random().nextIntWithMax(8)];


            if (dir != 0 && REGame.map.checkPassage(entity, dir, MovingMethod.Walk)) {
                context.postActivity(LActivity.makeDirectionChange(entity, dir));
                context.postActivity(LActivity.makeMoveToAdjacent(entity, dir));
            }
            context.postConsumeActionToken(entity);
            return SPhaseResult.Handled;
        }

        return super.onDecisionPhase(entity, context, phase);
    }
}
