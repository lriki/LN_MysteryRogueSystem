import { tr2 } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { REResponse, SPhaseResult } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { UName } from "ts/usecases/UName";
import { LCharacterAI } from "../ai/LCharacterAI";
import { LRatedRandomAI } from "../ai/LRatedRandomAI";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { LBattlerBehavior } from "./LBattlerBehavior";
import { CommandArgs, DecisionPhase, LBehavior, onGrounded, testPickOutItem } from "./LBehavior";

/**
 * 
 */
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
        const b = REGame.world.spawn(LRatedRandomAIBehavior);
        b._characterAI = this._characterAI.clone() as LRatedRandomAI;
        return b;
    }

    onQueryCharacterAI(characterAIs: LCharacterAI[]): void {
        characterAIs.push(this._characterAI);
    }

    onDecisionPhase(entity: LEntity, context: SCommandContext, phase: DecisionPhase): SPhaseResult {

        if (phase == DecisionPhase.Manual) {
            throw new Error("Not implemented.");
        }
        else if (phase == DecisionPhase.AIMinor) {
            return this._characterAI.thinkMoving(context, entity);
        }
        else if (phase == DecisionPhase.ResolveAdjacentAndMovingTarget) {
            return SPhaseResult.Pass;
        }
        else if (phase == DecisionPhase.AIMajor) {
            return this._characterAI.thinkAction(context, entity);
        }

        return SPhaseResult.Pass;
    }

}
