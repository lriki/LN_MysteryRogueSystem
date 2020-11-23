import { REData } from "ts/data/REData";
import { REGame } from "ts/RE/REGame";
import { DecisionPhase } from "ts/RE/REGame_Behavior";
import { REGame_Entity } from "ts/RE/REGame_Entity";
import { Helpers } from "ts/system/Helpers";
import { REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { LStateBehavior } from "./LStateBehavior";

export class LDebugMoveRightState extends LStateBehavior {

    onDecisionPhase(entity: REGame_Entity, context: RECommandContext, phase: DecisionPhase): REResponse {
        
        // 右へ移動するだけ
        let dir = 6;

        // ランダム移動
        //const table = [1,2,3,4,6,7,8,9];
        //const dir = table[REGame.world.random().nextIntWithMax(8)];


        if (dir != 0 && REGame.map.checkPassage(entity, dir)) {
            context.postActionTwoWay(REData.DirectionChangeActionId, entity, undefined, { direction: dir });
            context.postActionTwoWay(REData.MoveToAdjacentActionId, entity, undefined, { direction: dir });
        }
        context.postConsumeActionToken(entity);
        return REResponse.Consumed;
    }
}
