import { RECommand, REResponse } from "../../system/RECommand";
import { RECommandContext } from "../../system/RECommandContext";
import { LBehavior } from "./LBehavior";
import { ActionId, REData } from "ts/data/REData";
import { REGame } from "../REGame";
import { REGame_Entity } from "../REGame_Entity";
import { RESystem } from "ts/system/RESystem";
import { REDirectionChangeArgs, REMoveToAdjacentArgs } from "ts/commands/RECommandArgs";
import { Helpers } from "ts/system/Helpers";

/**
 * 
 */
export class REUnitBehavior extends LBehavior {
    onQueryReactions(): ActionId[] {
        return [REData.AttackActionId];
    }

    onAction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {

        if (cmd.action().id == REData.DirectionChangeActionId) {
            cmd.actor().dir = (cmd.args() as REDirectionChangeArgs).direction;
            return REResponse.Consumed;
        }

        else if (cmd.action().id == REData.MoveToAdjacentActionId) {
            

            const args = (cmd.args() as REMoveToAdjacentArgs);
            const offset = Helpers.dirToTileOffset(args.direction);

            if (REGame.map.moveEntity(entity, entity.x + offset.x, entity.y + offset.y, entity.queryProperty(RESystem.properties.homeLayer))) {
                context.postSequel(entity, RESystem.sequels.MoveSequel);

                // 次の DialogOpen 時に足元の優先コマンドを表示したりする
                entity.immediatelyAfterAdjacentMoving = true;
                
                return REResponse.Consumed;
            }
            
        }
        else if (cmd.action().id == REData.ProceedFloorActionId) {
            console.log("★");
        }
        else if (cmd.action().id == REData.AttackActionId) {
            console.log("AttackAction");


            context.postSequel(entity, RESystem.sequels.attack);


            const front = Helpers.makeEntityFrontPosition(entity, 1);
            const block = REGame.map.block(front.x, front.y);
            const reacor = context.findReactorEntityInBlock(block, REData.AttackActionId);
            if (reacor) {
                context.postReaction(REData.AttackActionId, reacor, cmd.effectContext());
            }

            /*


            context.postActionToBlock();
            */
            
            return REResponse.Consumed;
        }
        
        return REResponse.Pass;
    }

    
    onReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {
        if (cmd.action().id == REData.AttackActionId) {
            console.log("onReaction AttackAction");


            cmd.effectContext()?.apply(entity);

            
            return REResponse.Consumed;
        }

        return REResponse.Pass;
    }
}
