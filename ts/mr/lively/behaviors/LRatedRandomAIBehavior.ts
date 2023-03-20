import { MRSerializable } from "ts/mr/Common";
import { paramUseThinkingAgent } from "ts/mr/PluginParameters";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { LCharacterAI } from "../ai/LCharacterAI";
import { LRatedRandomAI } from "../ai/LRatedRandomAI";
import { LThinkingAgent } from "../ai2/LThinkingAgent";
import { LThinkingDeterminer_RatedRandom } from "../ai2/LThinkingDeterminer_RatedRandom";
import { LEntity } from "../LEntity";
import { MRLively } from "../MRLively";
import { DecisionPhase, LBehavior, LBehaviorGroup } from "./LBehavior";

/**
 * 
 */
@MRSerializable
export class LRatedRandomAIBehavior extends LBehavior {

    /*
        なぜ Behavior として実装するのか？
        ----------
        "封印" 状態の実装は Behavior の無効化として実装したいため。
        - "特殊能力" は Behavior として実装する。
        - "特性" は Trait として実装する。
    */

    private _characterAI: LRatedRandomAI = new LRatedRandomAI();
    private _thinking: LThinkingDeterminer_RatedRandom = new LThinkingDeterminer_RatedRandom();

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LRatedRandomAIBehavior);
        b._characterAI = this._characterAI.clone() as LRatedRandomAI;
        b._thinking = this._thinking.clone();
        return b;
    }

    public behaviorGroup(): LBehaviorGroup {
        return LBehaviorGroup.SpecialAbility;
    }

    onDecisionPhase(self: LEntity, cctx: SCommandContext, phase: DecisionPhase): SPhaseResult {

        if (paramUseThinkingAgent) {
            return SPhaseResult.Pass;
        }

        if (phase == DecisionPhase.Manual) {
            throw new Error("Not implemented.");
        }
        else if (phase == DecisionPhase.AIMinor) {
            return this._characterAI.thinkMoving(cctx, self);
        }
        else if (phase == DecisionPhase.ResolveAdjacentAndMovingTarget) {
            return SPhaseResult.Pass;
        }
        else if (phase == DecisionPhase.AIMajor) {
            return this._characterAI.thinkAction(cctx, self);
        }

        return SPhaseResult.Pass;
    }

    public override onThink(self: LEntity, agent: LThinkingAgent): SPhaseResult {
        if (paramUseThinkingAgent) {
            return this._thinking.onThink(agent, self);
        }
        return SPhaseResult.Pass;
    }

}
