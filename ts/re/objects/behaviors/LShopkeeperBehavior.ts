
import { DecisionPhase, LBehavior } from "./LBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { REGame } from "ts/re/objects/REGame";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { SPhaseResult } from "ts/re/system/RECommand";


/**
 */
export class LShopkeeperBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LShopkeeperBehavior);
        return b;
    }


    onDecisionPhase(context: SCommandContext, self: LEntity, phase: DecisionPhase): SPhaseResult {
        
        /*
        if (phase == DecisionPhase.AIMinor) {
            // 右へ移動するだけ
            let dir = 6;

            // ランダム移動
            //const table = [1,2,3,4,6,7,8,9];
            //const dir = table[REGame.world.random().nextIntWithMax(8)];


            if (dir != 0 && REGame.map.checkPassage(self, dir, MovingMethod.Walk)) {
                context.postActivity(LActivity.makeDirectionChange(self, dir));
                context.postActivity(LActivity.makeMoveToAdjacent(self, dir));
            }
            context.postConsumeActionToken(self);
            return SPhaseResult.Handled;
        }
        */

        return SPhaseResult.Pass;
    }
}
