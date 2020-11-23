import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { REResponse } from "../../system/RECommand";
import { RECommandContext } from "../../system/RECommandContext";
import { DecisionPhase, LBehavior } from "./LBehavior";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { REGame } from "ts/objects/REGame";
import { REData } from "ts/data/REData";
import { Helpers } from "ts/system/Helpers";
import { BlockLayerKind } from "ts/objects/REGame_Block";
import { RESystem } from "ts/system/RESystem";

/**
 * Scheduler から通知された各タイミングにおいて、行動決定を行う Behavior.
 * 
 * この Behavior は標準的な行動決定のみ行う。
 * 状態異常による行動制限(&経過ターンのデクリメント)・暴走は、状態異常の Behavior 側で onDecisionPhase() をフックして実装する。
 */
export class REGame_DecisionBehavior extends LBehavior
{
    onDecisionPhase(entity: REGame_Entity, context: RECommandContext, phase: DecisionPhase): REResponse {

        if (phase == DecisionPhase.Manual) {    // TODO: Manual っていう名前が良くない気がするので直したい。
            context.openDialog(entity, new REManualActionDialog());
            return REResponse.Consumed;
        }
        else if (phase == DecisionPhase.AIMinor) {
            // 右へ移動するだけ
            let dir = 6;

            // ランダム移動
            //const table = [1,2,3,4,6,7,8,9];
            //const dir = table[REGame.world.random().nextIntWithMax(8)];

            const front = Helpers.makeFrontPosition(entity.x, entity.y, dir, 1);
            const e = REGame.map.block(front).aliveEntity(BlockLayerKind.Unit);
            console.log("front", front);
            console.log("AAAAAAAAAA", REGame.map.block(front));
            console.log("AAAAAAAAAA", e);
            if (e) {
                context.postActionTwoWay(REData.DirectionChangeActionId, entity, undefined, { direction: dir });

                console.log("AAAAAAAAAA Attack");
                // 通常攻撃
                context.postPerformSkill(entity, RESystem.skills.normalAttack);
                return REResponse.Consumed;
            }

            if (dir != 0 && REGame.map.checkPassage(entity, dir)) {
                context.postActionTwoWay(REData.DirectionChangeActionId, entity, undefined, { direction: dir });
                context.postActionTwoWay(REData.MoveToAdjacentActionId, entity, undefined, { direction: dir });
            }
            context.postConsumeActionToken(entity);
            return REResponse.Consumed;
        }

        return REResponse.Pass;
    }

}
