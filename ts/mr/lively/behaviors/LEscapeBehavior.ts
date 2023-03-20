import { MRSerializable } from "ts/mr/Common";
import { paramUseThinkingAgent } from "ts/mr/PluginParameters";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { LEscapeAI } from "../ai/LEscapeAI";
import { LThinkingAgent } from "../ai2/LThinkingAgent";
import { LThinkingDeterminer_Escape } from "../ai2/LThinkingDeterminer_Escape";
import { DecisionPhase, LBehavior, LBehaviorGroup } from "../internal";
import { LEntity } from "../LEntity";
import { MRLively } from "../MRLively";


/**
 */
@MRSerializable
export class LEscapeBehavior extends LBehavior {
    private _escapeAI: LEscapeAI;
    private _thinking: LThinkingDeterminer_Escape;
    
    public constructor() {
        super();
        this._escapeAI = new LEscapeAI();
        this._thinking = new LThinkingDeterminer_Escape();
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LEscapeBehavior);
        b._thinking = this._thinking.clone();
        return b;
    }

    behaviorGroup(): LBehaviorGroup {
        return LBehaviorGroup.SpecialAbility;
    }
    
    onDecisionPhase(self: LEntity, cctx: SCommandContext, phase: DecisionPhase): SPhaseResult {
        if (!paramUseThinkingAgent) {
            if (phase == DecisionPhase.AIMinor) {
                this._escapeAI.thinkMoving(cctx, self);
                return SPhaseResult.Handled;
            }
            else if (phase == DecisionPhase.AIMajor) {
                this._escapeAI.thinkAction(cctx, self);
                return SPhaseResult.Handled;
            }
        }
        return SPhaseResult.Pass;
    }

    public override onThink(self: LEntity, agent: LThinkingAgent): SPhaseResult {
        return this._thinking.onThink(agent, self);
    }
}

