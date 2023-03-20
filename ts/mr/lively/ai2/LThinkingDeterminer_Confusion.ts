import { MRSerializable } from "ts/mr/Common";
import { MRData } from "ts/mr/data/MRData";
import { Helpers } from "ts/mr/system/Helpers";
import { SAIHelper } from "ts/mr/system/SAIHelper";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { UAction } from "ts/mr/utility/UAction";
import { UBlock } from "ts/mr/utility/UBlock";
import { UMovement } from "ts/mr/utility/UMovement";
import { LConfusionAIRestriction } from "../ai/LConfusionAI";
import { HMovement } from "../helpers/HMovement";
import { LEntity } from "../LEntity";
import { LMap, MovingMethod } from "../LMap";
import { MRLively } from "../MRLively";
import { LThinkingAction } from "./LThinkingAction";
import { LThinkingActionRatings, LThinkingAgent } from "./LThinkingAgent";
import { LThinkingDeterminer } from "./LThinkingDeterminer";
import { LThinkingHelper } from "./LThinkingHelper";

@MRSerializable
export class LThinkingDeterminer_Confusion extends LThinkingDeterminer {
    /*
        そもそも混乱は AI として実装するべき？ Activity のハンドラの中でフックしてもよいのでは？
        ----------
        AIの行動決定フェーズは次の3から成り立つ。
        - Think (行動を決める)
        - ExecuteMinor (実際に実行する)
        - ExecuteMajor (実際に実行する)
        なので、 Think で決めた物事は一度どこかに覚えておく必要がある。

        ### [2023/3/20] 更新
        新しい AI フレームワークに移行したことで、上記は必ずしも正しくはなくなった。
        GenericStateBehavior の onThink で実装してもかまわない。

        ひとまず旧AIからの移行を優先して似たAPIを作ったので、このままにしてみる。
    */

    private _restriction: LConfusionAIRestriction;

    public constructor(restriction: LConfusionAIRestriction) {
        super();
        this._restriction = restriction;
    }

    override clone(): LThinkingDeterminer_Confusion {
        return new LThinkingDeterminer_Confusion(this._restriction);
    }

    override onThink(agent: LThinkingAgent, self: LEntity): SPhaseResult {
        // 方向決定
        const dir = agent.rand.select(UMovement.directions);


        // 通常攻撃できるか試してみる。
        // 実際の攻撃は Major フェーズで行いたいので、ここでは行動は消費しない。
        // 攻撃候補を覚えておく。
        if (this._restriction != LConfusionAIRestriction.None) {
            const block = UMovement.getAdjacentBlock(self, dir);
            let targets = UAction.getSkillEffectiveTargets(self, MRData.skills[MRData.system.skills.normalAttack], false).filter(e => e.mx == block.mx && e.my == block.my);
    
            if (this._restriction == LConfusionAIRestriction.AttcakToFriend) {
                targets = targets.filter(x => Helpers.isFriend(self, x));
            }
            else if (this._restriction == LConfusionAIRestriction.AttcakToOpponent) {
                targets = targets.filter(x => Helpers.isHostile(self, x));
            }
    
            if (targets.length > 0) {
                const action = new LThinkingAction(
                    { 
                        rating: LThinkingActionRatings.Normal,
                        skillId: MRData.system.skills.normalAttack,
                    },
                    [targets[0].entityId()],
                );
                agent.addCandidateAction(action);
                return SPhaseResult.Pass;
            }
        }

        // 移動してみる。移動出来たら行動を消費する。
        if (UMovement.checkPassageToDir(self, dir)) {
            const action = new LThinkingAction(
                { 
                    rating: LThinkingActionRatings.Moving,
                    skillId: MRData.system.skills.move,
                },
                [],
            );
            action.priorityMovingDirection = dir;
            agent.addCandidateAction(action);
            return SPhaseResult.Pass;
        }

        return SPhaseResult.Pass;
    }
}

