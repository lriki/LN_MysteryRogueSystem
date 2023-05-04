import { MRSerializable } from "ts/mr/Common";
import { MRData } from "ts/mr/data/MRData";
import { SAIHelper } from "ts/mr/system/SAIHelper";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { UAction } from "ts/mr/utility/UAction";
import { UBlock } from "ts/mr/utility/UBlock";
import { UMovement } from "ts/mr/utility/UMovement";
import { HMovement } from "../helpers/HMovement";
import { LEntity } from "../entity/LEntity";
import { LMap, MovingMethod } from "../LMap";
import { MRLively } from "../MRLively";
import { LThinkingAction } from "./LThinkingAction";
import { LThinkingActionRatings, LThinkingAgent } from "./LThinkingAgent";
import { LThinkingDeterminer } from "./LThinkingDeterminer";
import { LThinkingHelper } from "./LThinkingHelper";

@MRSerializable
export class LThinkingDeterminer_Blind extends LThinkingDeterminer {
    /*
    [2023/3/17] 優先度と 混乱AI との衝突
    ----------
    混乱によるランダム移動は、目つぶしによる移動よりも優先度を高くする。
    ただ、このようにステート間が互いの事情に依存する優先度を考慮するのがちょっと気になる実装だが…。

    でも、逆に優先度を考慮しない場合は従来のように、後から追加されたステートが優先されてしまう。
    こればかりはある程度優先度のグループをつらざるを得ないのかも。
    */


    override clone(): LThinkingDeterminer_Blind {
        return new LThinkingDeterminer_Blind();
    }

    override onThink(agent: LThinkingAgent, self: LEntity): SPhaseResult {
        const frontDir = self.dir;

        // 正面に攻撃できそうな何かがあれば、行動候補として積む。
        const block = UMovement.getAdjacentBlock(self, frontDir);
        const targets = UAction.getSkillEffectiveTargets(self, MRData.skills[MRData.system.skills.normalAttack], false).filter(e => e.mx == block.mx && e.my == block.my);
        if (targets.length > 0) {
            const action = new LThinkingAction(
                { 
                    rating: LThinkingActionRatings.Restriction1,
                    skillId: MRData.system.skills.normalAttack,
                },
                [targets[0].entityId()],
            );
            agent.addCandidateAction(action);
        }

        // 正面に移動できそう？
        if (UMovement.checkPassageToDir(self, frontDir)) {
            const action = new LThinkingAction(
                { 
                    rating: LThinkingActionRatings.Restriction1,
                    skillId: MRData.system.skills.move,
                },
                [],
            );
            action.priorityMovingDirection = frontDir;
            agent.addCandidateAction(action);
            return SPhaseResult.Handled;
        }
        
        // 正面がダメなら、それ以外へランダムに移動してみる。
        const newDir = agent.rand.select(UMovement.directions.filter(x => x != frontDir));
        if (UMovement.checkPassageToDir(self, frontDir)) {
            const action = new LThinkingAction(
                { 
                    rating: LThinkingActionRatings.Restriction1,
                    skillId: MRData.system.skills.move,
                },
                [],
            );
            action.priorityMovingDirection = newDir;
            agent.addCandidateAction(action);
            return SPhaseResult.Handled;
        }

        // ここまで来てしまったら向きだけ変えて待機。
        const action = new LThinkingAction(
            { 
                rating: LThinkingActionRatings.Restriction1,
                skillId: MRData.system.skills.wait,
            },
            [],
        );
        action.priorityMovingDirection = newDir;
        agent.addCandidateAction(action);
        return SPhaseResult.Handled;
    }
}

