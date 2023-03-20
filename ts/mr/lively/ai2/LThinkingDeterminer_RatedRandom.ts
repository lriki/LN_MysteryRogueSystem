import { MRSerializable } from "ts/mr/Common";
import { MRData } from "ts/mr/data/MRData";
import { SAIHelper } from "ts/mr/system/SAIHelper";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { UAction } from "ts/mr/utility/UAction";
import { UBlock } from "ts/mr/utility/UBlock";
import { UMovement } from "ts/mr/utility/UMovement";
import { HMovement } from "../helpers/HMovement";
import { LEntity } from "../LEntity";
import { LMap, MovingMethod } from "../LMap";
import { MRLively } from "../MRLively";
import { LThinkingAction } from "./LThinkingAction";
import { LThinkingActionRatings, LThinkingAgent } from "./LThinkingAgent";
import { LThinkingDeterminer } from "./LThinkingDeterminer";
import { LThinkingHelper } from "./LThinkingHelper";

@MRSerializable
export class LThinkingDeterminer_RatedRandom extends LThinkingDeterminer {
    private _randomRate: number;

    public constructor() {
        super();
        this._randomRate = 50;
    }
    
    override clone(): LThinkingDeterminer_RatedRandom {
        const i = new LThinkingDeterminer_RatedRandom();
        i._randomRate = this._randomRate;
        return i;
    }

    override onThink(agent: LThinkingAgent, self: LEntity): SPhaseResult {
        const rundomTurn = (agent.rand.nextIntWithMax(100) < this._randomRate);
        if (rundomTurn) {
            // 移動してみる。攻撃はしない。
            const dir = agent.rand.select(UMovement.directions);
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
        }
        else {
            // 普通に行動したいので、この Determiner としては何もしない。
        }
        return SPhaseResult.Pass;
    }
}

