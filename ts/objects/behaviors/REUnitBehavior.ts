import { RECommand, REResponse } from "../../system/RECommand";
import { RECommandContext } from "../../system/RECommandContext";
import { CommandArgs, LBehavior, onAttackReaction, onPrePickUpReaction, onPreThrowReaction, onProceedFloorReaction, onThrowReaction, onWalkedOnTopAction, onWaveReaction } from "./LBehavior";
import { REData } from "ts/data/REData";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
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
import { SMomementCommon } from "ts/system/SMomementCommon";
import { REEffectContext } from "ts/system/REEffectContext";
import { LActivity } from "../activities/LActivity";
import { LDirectionChangeActivity } from "../activities/LDirectionChangeActivity";
import { LMoveAdjacentActivity } from "../activities/LMoveAdjacentActivity";
import { LPickActivity } from "../activities/LPickActivity";
import { LWaveActivity } from "../activities/LWaveActivity";
import { LPutActivity } from "../activities/LPutActivity";
import { LThrowActivity } from "../activities/LThrowActivity";
import { LProceedFloorActivity } from "../activities/LProceedFloorActivity";

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

    onActivity(self: LEntity, context: RECommandContext, activity: LActivity): REResponse {
        if (activity instanceof LDirectionChangeActivity) {
            console.log("onActivity LDirectionChangeActivity");
            self.dir = activity.direction();
            return REResponse.Succeeded;
        }
        else if (activity instanceof LMoveAdjacentActivity) {

            const offset = Helpers.dirToTileOffset(activity.direction());

            const layer = self.queryProperty(RESystem.properties.homeLayer);
            if (SMomementCommon.moveEntity(context, self, self.x + offset.x, self.y + offset.y, layer)) {
                context.postSequel(self, RESystem.sequels.MoveSequel);

                // 次の DialogOpen 時に足元の優先コマンドを表示したりする
                self.immediatelyAfterAdjacentMoving = true;
                this._requiredFeetProcess = true;
                
                return REResponse.Succeeded;
            }
        }
        else if (activity instanceof LProceedFloorActivity) {

            const reactor = activity.object();
            if (reactor) {
                context.post(reactor, self, undefined, onProceedFloorReaction);
            }

        }
        else if (activity instanceof LPickActivity) {

            const inventory = self.findBehavior(LInventoryBehavior);
            if (inventory) {
            
                const block = REGame.map.block(self.x, self.y);
                const layer = block.layer(BlockLayerKind.Ground);
                const targetEntities = layer.entities();

                if (targetEntities.length >= 1) {
                    const itemEntity = targetEntities[0];
    
                    context.post(
                        itemEntity, self, undefined, onPrePickUpReaction,
                        (responce: REResponse, itemEntity: LEntity, context: RECommandContext) => {
                            REGame.map._removeEntity(itemEntity);
                            inventory.addEntity(itemEntity);
                            context.postMessage(tr("{0} は {1} をひろった", "LRIKI", REGame.identifyer.makeDisplayText(itemEntity)));
                        });
    
                }

            }
        }
        else if (activity instanceof LPutActivity) {
            const itemEntity = activity.object();//cmd.reactor();
            const inventory = self.findBehavior(LInventoryBehavior);
            assert(itemEntity);
            assert(inventory);
            
            const block = REGame.map.block(self.x, self.y);
            const layer = block.layer(BlockLayerKind.Ground);
            if (!layer.isContainsAnyEntity()) {
                // 足元に置けそうなら試行
                context.post(
                    itemEntity, self, undefined, onPrePickUpReaction,
                    (responce: REResponse, reactor: LEntity, context: RECommandContext) => {
                        inventory.removeEntity(reactor);
                        REGame.map.appearEntity(reactor, self.x, self.y);

                        context.postMessage(tr("{0} を置いた。", REGame.identifyer.makeDisplayText(itemEntity)));
                    });
            }
            else {
                context.postMessage(tr("置けなかった。"));
            }
            return REResponse.Succeeded;
        }
        else if (activity instanceof LThrowActivity) {
            // [投げる] は便利コマンドのようなもの。
            // 具体的にどのように振舞うのか (直線に飛ぶのか、放物線状に動くのか、転がるのか) を決めるのは相手側

            const itemEntity = activity.object();
            //const inventory = actor.findBehavior(LInventoryBehavior);
            assert(itemEntity);
            //assert(inventory);

            context.post(
                itemEntity, self, undefined, onPreThrowReaction,
                (responce: REResponse, reactor: LEntity, context: RECommandContext) => {
                    if (responce == REResponse.Pass) {
                        itemEntity.callRemoveFromWhereabouts(context);

                        itemEntity.x = self.x;
                        itemEntity.y = self.y;


                        context.post(
                            itemEntity, self, undefined, onThrowReaction,
                            (responce: REResponse, reactor: LEntity, context: RECommandContext) => {
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
        else if (activity instanceof LWaveActivity) {
            context.postSequel(self, RESystem.sequels.attack);

            const reactor = activity.object();
            if (reactor) {
                //context.postReaction(DBasics.actions.WaveActionId, reactor, actor, cmd.effectContext());
                
                context.post(reactor, self, undefined, onWaveReaction);
            }
            
            return REResponse.Succeeded;
        }
        
        return REResponse.Pass;
    }
    
    onAction(actor: LEntity, context: RECommandContext, cmd: RECommand): REResponse {
        if (cmd.action().id == DBasics.actions.AttackActionId) {
            console.log("AttackAction");


            throw new Error("Unreachable");
            /*


            context.postActionToBlock();
            */
            
            return REResponse.Succeeded;
        }
        

        return REResponse.Pass;
    }

    
    [onAttackReaction](args: CommandArgs, context: RECommandContext): REResponse {
        const self = args.self;
        //const effectContext = cmd.effectContext();
        const effectContext: REEffectContext = args.args.effectContext;
        if (effectContext) {
            const result = effectContext.apply(self);
            
            console.log("result", result);

            result.showResultMessages(context, self);
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
        
        return REResponse.Pass;
    }


    [onWalkedOnTopAction](args: CommandArgs, context: RECommandContext): REResponse {
        return REResponse.Pass;
    }
}
