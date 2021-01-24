import { RECommand, REResponse } from "../../system/RECommand";
import { RECommandContext } from "../../system/RECommandContext";
import { CommandArgs, LBehavior, onPrePickUpReaction, onPreThrowReaction, onThrowReaction, onWalkedOnTopAction } from "./LBehavior";
import { REData } from "ts/data/REData";
import { REGame } from "../REGame";
import { REGame_Entity } from "../REGame_Entity";
import { RESystem } from "ts/system/RESystem";
import { REDirectionChangeArgs, REMoveToAdjacentArgs } from "ts/commands/RECommandArgs";
import { Helpers } from "ts/system/Helpers";
import { BlockLayerKind } from "../REGame_Block";
import { LInventoryBehavior } from "./LInventoryBehavior";
import { assert, tr, tr2 } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { LCommonBehavior } from "./LCommonBehavior";
import { SMessageBuilder } from "ts/system/SMessageBuilder";
import { DescriptionHighlightLevel, LEntityDescription } from "../LIdentifyer";
import { DActionId } from "ts/data/DAction";

/**
 * 
 */
export class REUnitBehavior extends LBehavior {

    // 歩行移動したため、足元にある Entity に対して処理が必要かどうか。
    // アイテムを拾おうとしたり、罠の起動判定を行ったりする。
    private _requiredFeetProcess: boolean = false;

    public requiredFeetProcess(): boolean {
        return this._requiredFeetProcess;
    }
    
    public clearFeetProcess(): void {
        this._requiredFeetProcess = false;
    }

    onQueryProperty(propertyId: number): any {
        if (propertyId == RESystem.properties.homeLayer)
            return BlockLayerKind.Unit;
        else
            super.onQueryProperty(propertyId);
    }
    
    onQueryActions(actions: DActionId[]): DActionId[] {
        return actions.concat([
            DBasics.actions.PickActionId,
            DBasics.actions.PutActionId,
            //DBasics.actions.ExchangeActionId,
            DBasics.actions.ThrowActionId,
        ]);
    }

    onQueryReactions(actions: DActionId[]): DActionId[] {
        return actions.concat([
            DBasics.actions.AttackActionId
        ]);
    }

    onAction(actor: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {
        
        if (cmd.action().id == DBasics.actions.DirectionChangeActionId) {
            cmd.actor().dir = (cmd.args() as REDirectionChangeArgs).direction;
            return REResponse.Succeeded;
        }

        else if (cmd.action().id == DBasics.actions.MoveToAdjacentActionId) {
            

            const args = (cmd.args() as REMoveToAdjacentArgs);
            const offset = Helpers.dirToTileOffset(args.direction);

            const layer = actor.queryProperty(RESystem.properties.homeLayer);
            if (REGame.map.moveEntity(actor, actor.x + offset.x, actor.y + offset.y, layer)) {
                context.postSequel(actor, RESystem.sequels.MoveSequel);

                // 次の DialogOpen 時に足元の優先コマンドを表示したりする
                actor.immediatelyAfterAdjacentMoving = true;
                this._requiredFeetProcess = true;
                
                return REResponse.Succeeded;
            }
            
        }
        else if (cmd.action().id == DBasics.actions.ProceedFloorActionId) {
            console.log("★");
        }
        else if (cmd.action().id == DBasics.actions.AttackActionId) {
            console.log("AttackAction");


            /*


            context.postActionToBlock();
            */
            
            return REResponse.Succeeded;
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
            return REResponse.Succeeded;
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
            return REResponse.Succeeded;
        }

        return REResponse.Pass;
    }

    
    onReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {
        if (cmd.action().id == DBasics.actions.AttackActionId) {

            const effectContext = cmd.effectContext();
            if (effectContext) {
                const result = effectContext.apply(entity);
                
                console.log("result", result);

                result.showResultMessages(context, entity);
                /*
    
                const name = LEntityDescription.makeDisplayText(SMessageBuilder.makeTargetName(entity), DescriptionHighlightLevel.UnitName);
                const hpDamage = result.paramEffects[RESystem.parameters.hp].damag;
    
                {
                    const damageText = LEntityDescription.makeDisplayText(hpDamage.toString(), DescriptionHighlightLevel.Number);
                    context.postMessage(tr2("%1に%2のダメージを与えた！").format(name, damageText));
                }

                {
                    
                    const states = result.addedStateObjects();
                    for (const state of states) {
                        const stateText = state.message1;
                        //const stateText = target.isActor() ? state.message1 : state.message2;
                        context.postMessage(stateText.format(name));
                    }
                }
    
                */
    
    
                //const fmt = tr2("%1 は倒れた。");
                //const fmt = tr2("%1 は %2 の経験値を得た。");

                return REResponse.Succeeded;
            }
            
        }

        return REResponse.Pass;
    }
    
    [onWalkedOnTopAction](args: CommandArgs, context: RECommandContext): REResponse {
        return REResponse.Pass;
    }
}
