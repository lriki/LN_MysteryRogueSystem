import { REGame } from "ts/mr/objects/REGame";
import { DecisionPhase, LBehavior } from "ts/mr/objects/behaviors/LBehavior";
import { LEntity } from "ts/mr/objects/LEntity";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { MovingMethod } from "../LMap";
import { LActivity } from "../activities/LActivity";
import { LActionTokenType } from "../LActionToken";
import { LActionTokenConsumeType } from "../LCommon";

export class LDebugMoveRightBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LDebugMoveRightBehavior);
        return b
    }

    onDecisionPhase( self: LEntity, cctx: SCommandContext,phase: DecisionPhase): SPhaseResult {
        
        if (phase == DecisionPhase.AIMinor) {
            // 右へ移動するだけ
            let dir = 6;

            // ランダム移動
            //const table = [1,2,3,4,6,7,8,9];
            //const dir = table[REGame.world.random().nextIntWithMax(8)];


            if (dir != 0 && REGame.map.checkPassage(self, dir, MovingMethod.Walk)) {
                cctx.postActivity(LActivity.makeDirectionChange(self, dir));
                cctx.postActivity(LActivity.makeMoveToAdjacent(self, dir));
            }
            cctx.postConsumeActionToken(self, LActionTokenConsumeType.MinorActed);
            return SPhaseResult.Handled;
        }

        return super.onDecisionPhase(self, cctx, phase);
    }
}
