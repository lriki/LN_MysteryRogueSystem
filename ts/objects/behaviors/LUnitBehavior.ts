import { REResponse } from "../../system/RECommand";
import { SCommandContext } from "../../system/SCommandContext";
import { CommandArgs, LBehavior, onAttackReaction, onDirectAttackDamaged, onPreThrowReaction, onProceedFloorReaction, onThrowReaction, onWalkedOnTopAction, onWaveReaction, testPickOutItem } from "./LBehavior";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { RESystem } from "ts/system/RESystem";
import { Helpers } from "ts/system/Helpers";
import { BlockLayerKind } from "../LBlockLayer";
import { LInventoryBehavior } from "./LInventoryBehavior";
import { assert, tr, tr2 } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DActionId } from "ts/data/DAction";
import { UMovement } from "ts/usecases/UMovement";
import { SEffectContext, SEffectSubject } from "ts/system/SEffectContext";
import { LActivity } from "../activities/LActivity";
import { DescriptionHighlightLevel, LEntityDescription } from "../LIdentifyer";
import { SSoundManager } from "ts/system/SSoundManager";
import { REData } from "ts/data/REData";
import { MovingMethod } from "../LMap";
import { onGrounded, testPutInItem } from "../internal";
import { PutEventArgs, WalkEventArgs } from "ts/data/predefineds/DBasicEvents";
import { DPrefabImage } from "ts/data/DPrefab";
import { UName } from "ts/usecases/UName";
import { SEmittorPerformer } from "ts/system/SEmittorPerformer";
import { DStateRestriction } from "ts/data/DState";
import { DTraits } from "ts/data/DTraits";

/**
 * 
 */
export class LUnitBehavior extends LBehavior {
    
    private _factionId: number = REData.system.factions.neutral;
    _speedLevel: number = 0;     // ユニットテスト用。 1 が基本, 0は無効値。2は倍速。3は3倍速。-1は鈍足。
    _waitTurnCount: number = 0;  // 内部パラメータ。待ち数。次のターン、行動できるかどうか。
    _manualMovement: boolean = false;    // マニュアル操作するかどうか。
    _targetingEntityId: number = 0;   // AIMinor Phase で、攻撃対象を確定したかどうか。以降、Run 内では iterationCount が残っていても MinorAction を行わない

    _straightDashing: boolean = false;
    _fastforwarding: boolean = false;
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LUnitBehavior);
        b._factionId = this._factionId;
        b._speedLevel = this._speedLevel;
        b._waitTurnCount = this._waitTurnCount;
        b._manualMovement = this._manualMovement;
        b._targetingEntityId = this._targetingEntityId;
        b._straightDashing = this._straightDashing;
        b._fastforwarding = this._fastforwarding;
        return b
    }

    // Battler params
    

    //factionId(): number { return this._factionId; }
    setFactionId(value: number): LUnitBehavior { this._factionId = value; return this; }

    //speedLevel(): number { return this._speedLevel; }
    setSpeedLevel(value: number): LUnitBehavior { this._speedLevel = value; return this; }

    waitTurnCount(): number { return this._waitTurnCount; }
    setWaitTurnCount(value: number): LUnitBehavior { this._waitTurnCount = value; return this; }

    manualMovement(): boolean { return this._manualMovement; }
    setManualMovement(value: boolean): LUnitBehavior { this._manualMovement = value; return this; }





    // 歩行移動したため、足元にある Entity に対して処理が必要かどうか。
    // アイテムを拾おうとしたり、罠の起動判定を行ったりする。
    private _requiredFeetProcess: boolean = false;





    
    public queryInnermostFactionId(): number | undefined {
        return this._factionId;
    }

    public queryOutwardFactionId(): number | undefined {
        return this._factionId;
    }





    public requiredFeetProcess(): boolean {
        return this._requiredFeetProcess;
    }
    
    public clearFeetProcess(): void {
        this._requiredFeetProcess = false;
    }

    queryCharacterFileName(): DPrefabImage | undefined {
        const e = this.ownerEntity().data();
        const p = REData.prefabs[e.prefabId];
        return p.image;
    }

    queryHomeLayer(): BlockLayerKind | undefined {
        return BlockLayerKind.Unit;
    }
    
    onQueryActions(actions: DActionId[]): DActionId[] {
        return actions.concat([
            DBasics.actions.PickActionId,
            DBasics.actions.PutActionId,
            //DBasics.actions.ExchangeActionId,
            DBasics.actions.ThrowActionId,
            DBasics.actions.ReadActionId,
        ]);
    }

    onQueryReactions(actions: DActionId[]): void {
        actions.push(DBasics.actions.AttackActionId);
    }

    onActivity(self: LEntity, context: SCommandContext, activity: LActivity): REResponse {
        const subject = new SEffectSubject(self);

        //if (self.traitsWithId(DTraits.SealActivity, activity.actionId()).length > 0) {
            //context.postMessage(tr2("行動できなかった！"));
            //return REResponse.Succeeded;
        //}


        if (activity.entityDirection() > 0) {
            self.dir = activity.entityDirection();
        }

        if (activity.actionId() == DBasics.actions.DirectionChangeActionId) {
            //self.dir = activity.direction();
            return REResponse.Succeeded;
        }
        else if (activity.actionId() == DBasics.actions.MoveToAdjacentActionId) {

            const offset = Helpers.dirToTileOffset(activity.direction());
            
            // Prepare event
            const args: WalkEventArgs = { walker: self, targetX: self.x + offset.x, targetY: self.y + offset.y };
            if (!REGame.eventServer.publish(DBasics.events.preWalk, args)) return REResponse.Canceled;

            if (activity.isFastForward()) {
                this._straightDashing = true;
            }

            const layer = self.getHomeLayer();
            if (UMovement.moveEntity(self, self.x + offset.x, self.y + offset.y, MovingMethod.Walk, layer)) {
                context.postSequel(self, RESystem.sequels.MoveSequel);

                // 次の DialogOpen 時に足元の優先コマンドを表示したりする
                self.immediatelyAfterAdjacentMoving = true;
                this._requiredFeetProcess = true;
                
                return REResponse.Succeeded;
            }
        }
        else if (activity.actionId() == DBasics.actions.performSkill) {
            if (activity.hasDirection()) self.dir = activity.direction();
            SEmittorPerformer.makeWithSkill(self, activity.skillId()).performe(context);
            return REResponse.Succeeded;
        }
        else if (activity.actionId() == DBasics.actions.ForwardFloorActionId ||
            activity.actionId() == DBasics.actions.BackwardFloorActionId) {

            const reactor = activity.object();
            if (reactor) {
                context.post(reactor, self, subject, undefined, onProceedFloorReaction);
            }

        }
        else if (activity.actionId() == DBasics.actions.PickActionId) {

            const inventory = self.findBehavior(LInventoryBehavior);
            if (inventory) {
            
                const block = REGame.map.block(self.x, self.y);
                const layer = block.layer(BlockLayerKind.Ground);
                const targetEntities = layer.entities();

                if (targetEntities.length >= 1) {
                    const itemEntity = targetEntities[0];
    
                    context.post(
                        self, itemEntity, subject, undefined, testPutInItem,
                        //itemEntity, self, subject, undefined, testPickOutItem,
                        () => {
                            REGame.map._removeEntity(itemEntity);
                            inventory.addEntityWithStacking(itemEntity);
                            
                            const name = LEntityDescription.makeDisplayText(UName.makeUnitName(self), DescriptionHighlightLevel.UnitName);
                            context.postMessage(tr("{0} は {1} をひろった", name, UName.makeNameAsItem(itemEntity)));
                            SSoundManager.playPickItem();

                            return true;
                        });
    
                }

            }
        }
        else if (activity.actionId() == DBasics.actions.PutActionId) {
            
            // Prepare event
            const args: PutEventArgs = { actor: self };
            if (!REGame.eventServer.publish(DBasics.events.prePut, args)) return REResponse.Canceled;

            const itemEntity = activity.object();//cmd.reactor();
            const inventory = self.findBehavior(LInventoryBehavior);
            assert(itemEntity);
            assert(inventory);
            
            const block = REGame.map.block(self.x, self.y);
            const layer = block.layer(BlockLayerKind.Ground);
            if (!layer.isContainsAnyEntity()) {
                // 足元に置けそうなら試行
                context.post(itemEntity, self, subject, undefined, testPickOutItem)
                    .then(() => {
                        itemEntity.removeFromParent();
                        //context.remo
                        //inventory.removeEntity(itemEntity);
                        REGame.map.appearEntity(itemEntity, self.x, self.y);

                        context.postMessage(tr("{0} を置いた。", UName.makeNameAsItem(itemEntity)));
                        context.post(itemEntity, self, subject, undefined, onGrounded);
                        return true;
                    });
            }
            else {
                context.postMessage(tr("置けなかった。"));
            }
            return REResponse.Succeeded;
        }
        else if (activity.actionId() == DBasics.actions.ThrowActionId) {
            // FIXME: [撃つ] とかなり似ているので、長くなるようならまとめたほうがいいかも

            // [投げる] は便利コマンドのようなもの。
            // 具体的にどのように振舞うのか (直線に飛ぶのか、放物線状に動くのか、転がるのか) を決めるのは相手側

            const itemEntity = activity.object();
            //const inventory = actor.findBehavior(LInventoryBehavior);
            assert(itemEntity);
            //assert(inventory);

            context.post(itemEntity, self, subject, undefined, onPreThrowReaction)
                .then(() => {
                    //itemEntity.callRemoveFromWhereabouts(context);

                    itemEntity.removeFromParent();
                    itemEntity.x = self.x;
                    itemEntity.y = self.y;

                    /*
                    let actual: LEntity;
                    if (itemEntity.isStacked()) {
                        // スタックされていれば減らして新たな entity を生成
                        actual = itemEntity.decreaseStack();
                        //console.log("self.floorId", self.floorId);
                        //REGame.world._transferEntity(actual, self.floorId, self.x, self.y);
                    }
                    else {
                        // スタックされていなければそのまま打ち出す
                        itemEntity.removeFromParent();
                        actual = itemEntity;
                    }

                    actual.x = self.x;
                    actual.y = self.y;
                    */


                    context.post(itemEntity, self, subject, undefined, onThrowReaction)
                        .then(() => {
                            context.postMessage(tr("{0} を投げた。", UName.makeNameAsItem(itemEntity)));
                            return true;
                        });

                    return true;
                });
            return REResponse.Succeeded;
        }
        else if (activity.actionId() == DBasics.actions.ShootingActionId) {
            // FIXME: [投げる] とかなり似ているので、長くなるようならまとめたほうがいいかも
            const itemEntity = activity.object();
            assert(itemEntity);

            context.post(itemEntity, self, subject, undefined, onPreThrowReaction)
                .then(() => {
                    let actual: LEntity;
                    if (itemEntity.isStacked()) {
                        // スタックされていれば減らして新たな entity を生成
                        actual = itemEntity.decreaseStack();
                        //console.log("self.floorId", self.floorId);
                        //REGame.world._transferEntity(actual, self.floorId, self.x, self.y);
                    }
                    else {
                        // スタックされていなければそのまま打ち出す
                        itemEntity.removeFromParent();
                        actual = itemEntity;
                    }

                    actual.x = self.x;
                    actual.y = self.y;


                    context.post(actual, self, subject, undefined, onThrowReaction)
                        .then(() => {
                            console.log("...", UName.makeNameAsItem(actual));
                            context.postMessage(tr("{0} を撃った", UName.makeNameAsItem(actual)));
                            return true;
                        });

                    return true;
                });
            return REResponse.Succeeded;
        }
        else if (activity.actionId() == DBasics.actions.ExchangeActionId) {
            
            const inventory = self.getBehavior(LInventoryBehavior);
            const item1 = activity.object();
            const block = REGame.map.block(self.x, self.y);
            const layer = block.layer(BlockLayerKind.Ground);
            const item2 = layer.firstEntity();
            if (item2) {
                // TODO: 呪いの処理など、アイテムを今いる場所から取り外せるかチェック入れる

                REGame.map._removeEntity(item2);
                inventory.removeEntity(item1);

                REGame.map.appearEntity(item1, self.x, self.y);
                inventory.addEntity(item2);

                context.postMessage(tr("{0} と {1} を交換した。", UName.makeNameAsItem(item1), UName.makeNameAsItem(item2)));
                SSoundManager.playPickItem();
            }
            else {
                context.postMessage(tr2("足元には何もない。"));
            }

        }
        else if (activity.actionId() == DBasics.actions.WaveActionId) {
            context.postSequel(self, RESystem.sequels.attack);

            const reactor = activity.object();
            if (reactor) {
                context.post(reactor, self, subject, undefined, onWaveReaction);
                // TODO: onWaveReaction 使ってない。onActivityReaction に共通化した。
            }
            
            return REResponse.Succeeded;
        }
        // [読む] ※↑の[振る] や EaterBehavior とほぼ同じ実装になっている。共通化したいところ。
        else if (activity.actionId() == DBasics.actions.ReadActionId) {
            context.postSequel(self, RESystem.sequels.attack);
            // 続いて onActivityReaction を実行する。
            return REResponse.Succeeded;
        }
        else if (activity.actionId() == DBasics.actions.PutInActionId) {
            const selfInventory = self.getBehavior(LInventoryBehavior);
            const storage = activity.object();
            const storageInventory = storage.getBehavior(LInventoryBehavior);
            const items = activity.objects2();
            
            for (const item of items) {
                item.removeFromParent();
                storageInventory.addEntity(item);
                context.postMessage(tr("{0} を入れた。", UName.makeNameAsItem(item)));
            }
        }
        
        return REResponse.Pass;
    }
    
    [onAttackReaction](args: CommandArgs, context: SCommandContext): REResponse {
        const self = args.self;
        //const effectContext = cmd.effectContext();
        const effectContext: SEffectContext = args.args.effectContext;
        if (effectContext) {
            const targets = [self];
            effectContext.applyWithWorth(context, targets);


            
            if (!self.states().find(s => s.stateData().restriction == DStateRestriction.Blind)) {
                // 相手の方向を向く
                self.dir = UMovement.getLookAtDir(self, effectContext.effectorFact().subject());
            }

            for (const target of targets) {
                if (target._effectResult.isHit()) {
                    context.post(target, self, new SEffectSubject(effectContext.effectorFact().subject()), undefined, onDirectAttackDamaged);

                    
                }
            }

            

            context.postCall(() => {
                self.sendPartyEvent(DBasics.events.effectReacted, undefined);
            });

            return REResponse.Succeeded;
        }
        
        return REResponse.Pass;
    }


    [onWalkedOnTopAction](args: CommandArgs, context: SCommandContext): REResponse {
        return REResponse.Pass;
    }
}
