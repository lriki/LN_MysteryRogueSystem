import { RECommand, REResponse } from "../../system/RECommand";
import { SCommandContext } from "../../system/SCommandContext";
import { CommandArgs, LBehavior, onAttackReaction, onPrePickUpReaction, onPreThrowReaction, onProceedFloorReaction, onThrowReaction, onWalkedOnTopAction, onWaveReaction } from "./LBehavior";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { RESystem } from "ts/system/RESystem";
import { Helpers } from "ts/system/Helpers";
import { BlockLayerKind } from "../LBlock";
import { LInventoryBehavior } from "./LInventoryBehavior";
import { assert, tr, tr2 } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DActionId } from "ts/data/DAction";
import { SMomementCommon } from "ts/system/SMomementCommon";
import { REEffectContext, SEffectorFact, SEffectSubject } from "ts/system/REEffectContext";
import { LActivity } from "../activities/LActivity";
import { LDirectionChangeActivity } from "../activities/LDirectionChangeActivity";
import { LMoveAdjacentActivity } from "../activities/LMoveAdjacentActivity";
import { LPickActivity } from "../activities/LPickActivity";
import { LWaveActivity } from "../activities/LWaveActivity";
import { LPutActivity } from "../activities/LPutActivity";
import { LThrowActivity } from "../activities/LThrowActivity";
import { LForwardFloorActivity } from "../activities/LForwardFloorActivity";
import { DescriptionHighlightLevel, LEntityDescription } from "../LIdentifyer";
import { SMessageBuilder } from "ts/system/SMessageBuilder";

/**
 * 
 */
export class REUnitBehavior extends LBehavior {
    
    _factionId: number = 0;
    _speedLevel: number = 1;     // 1 が基本, 0は無効値。2は倍速。3は3倍速。-1は鈍足。
    _waitTurnCount: number = 0;  // 内部パラメータ。待ち数。次のターン、行動できるかどうか。
    _manualMovement: boolean = false;    // マニュアル操作するかどうか。
    _actionTokenCount: number = 0;
    _targetingEntityId: number = 0;   // AIMinor Phase で、攻撃対象を確定したかどうか。以降、Run 内では iterationCount が残っていても MinorAction を行わない

    _straightDashing: boolean = false;

    // Battler params
    

    factionId(): number { return this._factionId; }
    setFactionId(value: number): REUnitBehavior { this._factionId = value; return this; }

    speedLevel(): number { return this._speedLevel; }
    setSpeedLevel(value: number): REUnitBehavior { this._speedLevel = value; return this; }

    waitTurnCount(): number { return this._waitTurnCount; }
    setWaitTurnCount(value: number): REUnitBehavior { this._waitTurnCount = value; return this; }

    manualMovement(): boolean { return this._manualMovement; }
    setManualMovement(value: boolean): REUnitBehavior { this._manualMovement = value; return this; }

    actionTokenCount(): number { return this._actionTokenCount; }
    setActionTokenCount(value: number): REUnitBehavior { this._actionTokenCount = value; return this; }
    clearActionTokenCount(): void { this._actionTokenCount = 0; }





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

    onActivity(self: LEntity, context: SCommandContext, activity: LActivity): REResponse {
        const subject = new SEffectSubject(self);

        if (activity instanceof LDirectionChangeActivity) {
            self.dir = activity.direction();
            return REResponse.Succeeded;
        }
        else if (activity instanceof LMoveAdjacentActivity) {

            const offset = Helpers.dirToTileOffset(activity.direction());

            const layer = self.queryProperty(RESystem.properties.homeLayer);
            if (SMomementCommon.moveEntity(self, self.x + offset.x, self.y + offset.y, layer)) {
                context.postSequel(self, RESystem.sequels.MoveSequel);

                // 次の DialogOpen 時に足元の優先コマンドを表示したりする
                self.immediatelyAfterAdjacentMoving = true;
                this._requiredFeetProcess = true;
                
                return REResponse.Succeeded;
            }
        }
        else if (activity instanceof LForwardFloorActivity) {

            const reactor = activity.object();
            if (reactor) {
                context.post(reactor, self, subject, undefined, onProceedFloorReaction);
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
                        itemEntity, self, subject, undefined, onPrePickUpReaction,
                        (responce: REResponse, itemEntity: LEntity, context: SCommandContext) => {
                            REGame.map._removeEntity(itemEntity);
                            inventory.addEntity(itemEntity);
                            
                            const name = LEntityDescription.makeDisplayText(SMessageBuilder.makeTargetName(self), DescriptionHighlightLevel.UnitName);
                            context.postMessage(tr("{0} は {1} をひろった", name, REGame.identifyer.makeDisplayText(itemEntity)));
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
                    itemEntity, self, subject, undefined, onPrePickUpReaction,
                    (responce: REResponse, reactor: LEntity, context: SCommandContext) => {
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
                itemEntity, self, subject, undefined, onPreThrowReaction,
                (responce: REResponse, reactor: LEntity, context: SCommandContext) => {
                    if (responce == REResponse.Pass) {
                        itemEntity.callRemoveFromWhereabouts(context);

                        itemEntity.x = self.x;
                        itemEntity.y = self.y;


                        context.post(
                            itemEntity, self, subject, undefined, onThrowReaction,
                            (responce: REResponse, reactor: LEntity, context: SCommandContext) => {
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
                
                context.post(reactor, self, subject, undefined, onWaveReaction);
            }
            
            return REResponse.Succeeded;
        }
        
        return REResponse.Pass;
    }
    
    [onAttackReaction](args: CommandArgs, context: SCommandContext): REResponse {
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


    [onWalkedOnTopAction](args: CommandArgs, context: SCommandContext): REResponse {
        return REResponse.Pass;
    }
}
