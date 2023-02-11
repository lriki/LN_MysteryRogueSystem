import { MRSerializable } from "ts/mr/Common";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { LCharacterAI } from "../ai/LCharacterAI";
import { LRatedRandomAI } from "../ai/LRatedRandomAI";
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

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LRatedRandomAIBehavior);
        b._characterAI = this._characterAI.clone() as LRatedRandomAI;
        return b;
    }

    public behaviorGroup(): LBehaviorGroup {
        return LBehaviorGroup.SpecialAbility;
    }

    onDecisionPhase(self: LEntity, cctx: SCommandContext, phase: DecisionPhase): SPhaseResult {

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

}
