import { MRLively } from "ts/mr/lively/MRLively";
import { DecisionPhase, LBehavior } from "ts/mr/lively/behaviors/LBehavior";
import { LEntity } from "ts/mr/lively/LEntity";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { MovingMethod } from "../LMap";
import { LActivity } from "../activities/LActivity";
import { LActionTokenType } from "../LActionToken";
import { LActionTokenConsumeType } from "../LCommon";
import { MRSerializable } from "ts/mr/Common";
import { LThinkingActionRatings, LThinkingAgent } from "../ai2/LThinkingAgent";
import { MRData } from "ts/mr/data/MRData";
import { paramUseThinkingAgent } from "ts/mr/PluginParameters";
import { LThinkingAction } from "../ai2/LThinkingAction";


@MRSerializable
export class LDebugMoveRightBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LDebugMoveRightBehavior);
        return b
    }

    onDecisionPhase( self: LEntity, cctx: SCommandContext,phase: DecisionPhase): SPhaseResult {
        if (paramUseThinkingAgent) return SPhaseResult.Pass;
        
        if (phase == DecisionPhase.AIMinor) {
            // 右へ移動するだけ
            let dir = 6;

            // ランダム移動
            //const table = [1,2,3,4,6,7,8,9];
            //const dir = table[REGame.world.random().nextIntWithMax(8)];


            if (dir != 0 && MRLively.mapView.currentMap.checkPassage(self, dir, MovingMethod.Walk)) {
                cctx.postActivity(LActivity.makeDirectionChange(self, dir));
                cctx.postActivity(LActivity.makeMoveToAdjacent(self, dir));
            }
            cctx.postConsumeActionToken(self, LActionTokenConsumeType.MinorActed);
            return SPhaseResult.Handled;
        }

        return super.onDecisionPhase(self, cctx, phase);
    }

    
    public onThink(self: LEntity, agent: LThinkingAgent): SPhaseResult {
        const action = new LThinkingAction(
            { 
                rating: LThinkingActionRatings.Max,
                skillId: MRData.system.skills.move,
            },
            []
        );
        action.priorityMovingDirection = 6;
        agent.addCandidateAction(action);
        return SPhaseResult.Pass; 
    }
}
