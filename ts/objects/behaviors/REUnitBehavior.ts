import { RECommand, REResponse } from "../../system/RECommand";
import { RECommandContext } from "../../system/RECommandContext";
import { LBehavior, onPrePickUpReaction, onPreThrowReaction, onThrowReaction } from "./LBehavior";
import { ActionId, REData } from "ts/data/REData";
import { REGame } from "../REGame";
import { REGame_Entity } from "../REGame_Entity";
import { RESystem } from "ts/system/RESystem";
import { REDirectionChangeArgs, REMoveToAdjacentArgs } from "ts/commands/RECommandArgs";
import { Helpers } from "ts/system/Helpers";
import { BlockLayerKind } from "../REGame_Block";
import { LInventoryBehavior } from "./LInventoryBehavior";
import { assert, tr } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { LCommonBehavior } from "./LCommonBehavior";

/**
 * 
 */
export class REUnitBehavior extends LBehavior {
    
    onQueryProperty(propertyId: number): any {
        return BlockLayerKind.Unit;
    }
    
    onQueryActions(actions: ActionId[]): ActionId[] {
        return actions.concat([
            DBasics.actions.PickActionId,
            DBasics.actions.PutActionId,
            //DBasics.actions.ExchangeActionId,
            DBasics.actions.ThrowActionId,
        ]);
    }

    onQueryReactions(actions: ActionId[]): ActionId[] {
        return actions.concat([
            DBasics.actions.AttackActionId
        ]);
    }

    onAction(actor: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {
        
        if (cmd.action().id == DBasics.actions.DirectionChangeActionId) {
            cmd.actor().dir = (cmd.args() as REDirectionChangeArgs).direction;
            return REResponse.Consumed;
        }

        else if (cmd.action().id == DBasics.actions.MoveToAdjacentActionId) {
            

            const args = (cmd.args() as REMoveToAdjacentArgs);
            const offset = Helpers.dirToTileOffset(args.direction);

            if (REGame.map.moveEntity(actor, actor.x + offset.x, actor.y + offset.y, actor.queryProperty(RESystem.properties.homeLayer))) {
                context.postSequel(actor, RESystem.sequels.MoveSequel);

                // 次の DialogOpen 時に足元の優先コマンドを表示したりする
                actor.immediatelyAfterAdjacentMoving = true;
                
                return REResponse.Consumed;
            }
            
        }
        else if (cmd.action().id == DBasics.actions.ProceedFloorActionId) {
            console.log("★");
        }
        else if (cmd.action().id == DBasics.actions.AttackActionId) {
            console.log("AttackAction");


            context.postSequel(actor, RESystem.sequels.attack);


            const front = Helpers.makeEntityFrontPosition(actor, 1);
            const block = REGame.map.block(front.x, front.y);
            const reacor = context.findReactorEntityInBlock(block, DBasics.actions.AttackActionId);
            if (reacor) {
                context.postReaction(DBasics.actions.AttackActionId, reacor, cmd.effectContext());
            }

            /*


            context.postActionToBlock();
            */
            
            return REResponse.Consumed;
        }
        else if (cmd.action().id == DBasics.actions.PickActionId) {

            const inventory = actor.findBehavior(LInventoryBehavior);
            if (inventory) {
            
                const block = REGame.map.block(actor.x, actor.y);
                const layer = block.layer(BlockLayerKind.Ground);
                const targetEntities = layer.entities();

                if (targetEntities.length >= 1) {
                    const itemEntity = targetEntities[0];
    
                    context.post(
                        itemEntity, actor, undefined, onPrePickUpReaction,
                        (responce: REResponse, itemEntity: REGame_Entity, context: RECommandContext) => {
                            REGame.map._removeEntity(itemEntity);
                            inventory.addEntity(itemEntity);
                            context.postMessage(tr("{0} は {1} をひろった", "LRIKI", REGame.identifyer.makeDisplayText(itemEntity)));
                        });
    
                }

            }
        }
        else if (cmd.action().id == DBasics.actions.PutActionId) {
            const itemEntity = cmd.reactor();
            const inventory = actor.findBehavior(LInventoryBehavior);
            assert(itemEntity);
            assert(inventory);
            
            const block = REGame.map.block(actor.x, actor.y);
            const layer = block.layer(BlockLayerKind.Ground);
            if (!layer.isContainsAnyEntity()) {
                // 足元に置けそうなら試行
                context.post(
                    itemEntity, actor, undefined, onPrePickUpReaction,
                    (responce: REResponse, reactor: REGame_Entity, context: RECommandContext) => {
                        inventory.removeEntity(reactor);
                        REGame.map.appearEntity(reactor, actor.x, actor.y);

                        context.postMessage(tr("{0} を置いた。", REGame.identifyer.makeDisplayText(itemEntity)));
                    });
            }
            else {
                context.postMessage(tr("置けなかった。"));
            }
            return REResponse.Consumed;
        }
        else if (cmd.action().id == DBasics.actions.ThrowActionId) {
            // [投げる] は便利コマンドのようなもの。
            // 具体的にどのように振舞うのか (直線に飛ぶのか、放物線状に動くのか、転がるのか) を決めるのは相手側

            const itemEntity = cmd.reactor();
            //const inventory = actor.findBehavior(LInventoryBehavior);
            assert(itemEntity);
            //assert(inventory);

            context.post(
                itemEntity, actor, undefined, onPreThrowReaction,
                (responce: REResponse, reactor: REGame_Entity, context: RECommandContext) => {
                    if (responce == REResponse.Pass) {
                        itemEntity.callRemoveFromWhereabouts(context);

                        itemEntity.x = actor.x;
                        itemEntity.y = actor.y;


                        context.post(
                            itemEntity, actor, undefined, onThrowReaction,
                            (responce: REResponse, reactor: REGame_Entity, context: RECommandContext) => {
                                if (responce == REResponse.Pass) {
                                    context.postMessage(tr("{0} を投げた。", REGame.identifyer.makeDisplayText(itemEntity)));
                                }
                            });

                    }
                });

                /*
            // まずは itemEntity を、Inventory や Map から外してみる
            context.postRemoveFromWhereabouts(
                itemEntity,
                (responce: REResponse, reactor: REGame_Entity, context: RECommandContext) => {
                    if (responce == REResponse.Pass) {
                        
                    }
                });
                */
            
            /*
                */
            return REResponse.Consumed;
        }

        return REResponse.Pass;
    }

    
    onReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {
        if (cmd.action().id == DBasics.actions.AttackActionId) {
            console.log("onReaction AttackAction");


            cmd.effectContext()?.apply(entity);

            
            return REResponse.Consumed;
        }

        return REResponse.Pass;
    }
}
