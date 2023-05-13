import { MRSerializable } from "ts/mr/Common";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { UAction } from "ts/mr/utility/UAction";
import { LEntity } from "../entity/LEntity";
import { LThinkingAction } from "./LThinkingAction";
import { LThinkingActionRatings, LThinkingAgent } from "./LThinkingAgent";
import { LThinkingDeterminer } from "./LThinkingDeterminer";
import { HDimension } from "../helpers/HDimension";
import { MRData } from "ts/mr/data/MRData";

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


        {
            // Folloer としてパーティに参加していて、視界内にリーダーがいる場合は、リーダーに追従する
            const party = self.party();
            if (party && party.isFollower(self)) {
                const leader = party.leader;
                if (1/*USearch.checkInSightBlockFromSubject(self, leader)*/) {

                        // リーダーに隣接しているときは待機。うろうろしない。
                    let pos = [leader.mx, leader.my];
                    if (HDimension.getMoveDistanceEntites(self, leader) <= 1) {
                        pos = [self.mx, self.my];
                    }

                    const action = new LThinkingAction(
                        { 
                            rating: LThinkingActionRatings.Moving,
                            skillId: MRData.system.skills.move,
                        },
                        [],
                    );
                    //action.priorityMovingDirection = dir;
                    action.priorityTargetX = pos[0];
                    action.priorityTargetY = pos[1];
                    agent.addCandidateAction(action);
                }
            }
            
            
        }
        
        return SPhaseResult.Handled;
    }
}

