import { MRSerializable } from "ts/mr/Common";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { UAction } from "ts/mr/utility/UAction";
import { LEntity } from "../LEntity";
import { LThinkingAction } from "./LThinkingAction";
import { LThinkingAgent } from "./LThinkingAgent";
import { LThinkingDeterminer } from "./LThinkingDeterminer";

@MRSerializable
export class LThinkingDeterminer_Combat extends LThinkingDeterminer {

    override clone(): LThinkingDeterminer_Combat {
        return new LThinkingDeterminer_Combat();
    }

    override onThink(agent: LThinkingAgent, self: LEntity): SPhaseResult {
        
        //this._requiredSkillAction = undefined;
        const candidates = UAction.makeCandidateSkillActions(self, agent.primaryTargetEntityId);
        // const skillAction = cctx.random().selectOrUndefined(candidates);
        // if (skillAction) {
        //     if (skillAction.action.skillId == MRData.system.skills.move) {
        //         // 移動
        //         //this._attackTargetEntityId = LEntityId.makeEmpty();
        //     }
        //     else {
        //         this._requiredSkillAction = skillAction;
        //         //this._attackTargetEntityId = target.entityId();

        //     }

        // }
        // else {
        //     //this._attackTargetEntityId = LEntityId.makeEmpty();
        //     // 見失ったときも targetPosition は維持
        // }

        for (const action of candidates) {
            agent.addCandidateAction(new LThinkingAction(
                action.action,
                action.targets,
            ));
        }
        
        return SPhaseResult.Handled;
    }
}

