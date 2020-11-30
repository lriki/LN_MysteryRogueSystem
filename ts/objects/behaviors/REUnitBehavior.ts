import { RECommand, REResponse } from "../../system/RECommand";
import { RECommandContext } from "../../system/RECommandContext";
import { LBehavior, onPrePickUpReaction } from "./LBehavior";
import { ActionId, REData } from "ts/data/REData";
import { REGame } from "../REGame";
import { REGame_Entity } from "../REGame_Entity";
import { RESystem } from "ts/system/RESystem";
import { REDirectionChangeArgs, REMoveToAdjacentArgs } from "ts/commands/RECommandArgs";
import { Helpers } from "ts/system/Helpers";
import { BlockLayerKind } from "../REGame_Block";
import { LInventoryBehavior } from "./LInventoryBehavior";

/**
 * 
 */
export class REUnitBehavior extends LBehavior {
    
    onQueryProperty(propertyId: number): any {
        return BlockLayerKind.Unit;
    }
    
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
        else if (cmd.action().id == REData.PickActionId) {

            //console.log("func.call s");
            //const s: Symbol = onPrePickUpReaction;
            //const func = this[s];//Object.getPrototypeOf(this).onQueryProperty;
            //func.call(this, context);
            //console.log("func.call e");
            const inventory = entity.findBehavior(LInventoryBehavior);
            if (inventory) {
            
                const block = REGame.map.block(entity.x, entity.y);
                const layer = block.layer(BlockLayerKind.Ground);
                const targetEntities = layer.entities();
                if (targetEntities.length >= 1) {
                    const targetEntity = targetEntities[0];
    
                    
                    console.log("AA pick post");
                    context.post(
                        targetEntity, onPrePickUpReaction,
                        (responce: REResponse, targetEntity: REGame_Entity, context: RECommandContext) => {
                            REGame.map._removeEntity(targetEntity);
                            inventory.addEntity(targetEntity);
                            
                            console.log("PICK!!!!!");
                        });
    
                }
    
                console.log("AA pick");

            }
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
