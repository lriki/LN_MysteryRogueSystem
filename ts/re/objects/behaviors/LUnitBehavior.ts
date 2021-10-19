import { SCommandResponse, SPhaseResult } from "../../system/RECommand";
import { SCommandContext, SHandleCommandResult } from "../../system/SCommandContext";
import { CommandArgs, LBehavior, onAttackReaction, onDirectAttackDamaged, onPreThrowReaction, onProceedFloorReaction, onThrowReaction, onWalkedOnTopAction, onWaveReaction, testPickOutItem } from "./LBehavior";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { Helpers } from "ts/re/system/Helpers";
import { LInventoryBehavior } from "./LInventoryBehavior";
import { assert, RESerializable, tr, tr2 } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { DActionId } from "ts/re/data/DAction";
import { UMovement } from "ts/re/usecases/UMovement";
import { SEffectContext, SEffectSubject } from "ts/re/system/SEffectContext";
import { LActivity } from "../activities/LActivity";
import { DescriptionHighlightLevel, LEntityDescription } from "../LIdentifyer";
import { SSoundManager } from "ts/re/system/SSoundManager";
import { DFactionId, REData } from "ts/re/data/REData";
import { MovingMethod } from "../LMap";
import { DecisionPhase, onGrounded, testPutInItem } from "../internal";
import { PutEventArgs, WalkEventArgs } from "ts/re/data/predefineds/DBasicEvents";
import { DPrefabActualImage } from "ts/re/data/DPrefab";
import { UName } from "ts/re/usecases/UName";
import { SEmittorPerformer } from "ts/re/system/SEmittorPerformer";
import { DStateRestriction } from "ts/re/data/DState";
import { SView } from "ts/re/system/SView";
import { UAction } from "ts/re/usecases/UAction";
import { SEventExecutionDialog } from "ts/re/system/dialogs/SEventExecutionDialog";
import { DBlockLayerKind } from "ts/re/data/DCommon";
import { LGoldBehavior } from "./LGoldBehavior";
import { SAIHelper } from "ts/re/system/SAIHelper";
import { USearch } from "ts/re/usecases/USearch";

/**
 * 
 */
@RESerializable
export class LUnitBehavior extends LBehavior {
    
    private _factionId: DFactionId = REData.system.factions.neutral;
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
    setFactionId(value: DFactionId): LUnitBehavior { this._factionId = value; return this; }

    //speedLevel(): number { return this._speedLevel; }
    setSpeedLevel(value: number): LUnitBehavior { this._speedLevel = value; return this; }

    waitTurnCount(): number { return this._waitTurnCount; }
    setWaitTurnCount(value: number): LUnitBehavior { this._waitTurnCount = value; return this; }

    manualMovement(): boolean { return this._manualMovement; }
    setManualMovement(value: boolean): LUnitBehavior { this._manualMovement = value; return this; }





    // 歩行移動したため、足元にある Entity に対して処理が必要かどうか。
    // アイテムを拾おうとしたり、罠の起動判定を行ったりする。
    private _requiredFeetProcess: boolean = false;





    
    public queryInnermostFactionId(): DFactionId | undefined {
        return this._factionId;
    }

    public queryOutwardFactionId(): DFactionId | undefined {
        return this._factionId;
    }





    public requiredFeetProcess(): boolean {
        return this._requiredFeetProcess;
    }
    
    public clearFeetProcess(): void {
        this._requiredFeetProcess = false;
    }

    queryCharacterFileName(): DPrefabActualImage | undefined {
        const self = this.ownerEntity();
        const e = self.data();
        const p = REData.prefabs[e.prefabId];
        
        const image = { ...p.image };
        if (p.stateImages.length > 0) {
            self.iterateStates(s => {
                const i = p.stateImages.find(x => x.stateId == s.stateDataId());
                if (i) {
                    image.characterName = i.characterName;
                    image.characterIndex = i.characterIndex;
                    return false;
                }
                return true;
            });
        }

        return image;
    }

    queryHomeLayer(): DBlockLayerKind | undefined {
        return DBlockLayerKind.Unit;
    }
    
    onQueryActions(actions: DActionId[]): DActionId[] {
        return actions.concat([
            REBasics.actions.PickActionId,
            REBasics.actions.PutActionId,
            //DBasics.actions.ExchangeActionId,
            REBasics.actions.ThrowActionId,
            REBasics.actions.ReadActionId,
        ]);
    }

    onQueryReactions(actions: DActionId[]): void {
        actions.push(REBasics.actions.AttackActionId);
    }

    onActivity(self: LEntity, context: SCommandContext, activity: LActivity): SCommandResponse {
        const subject = new SEffectSubject(self);

        //if (self.traitsWithId(DTraits.SealActivity, activity.actionId()).length > 0) {
            //context.postMessage(tr2("行動できなかった！"));
            //return REResponse.Succeeded;
        //}


        if (activity.entityDirection() > 0) {
            self.dir = activity.entityDirection();
        }

        if (activity.actionId() == REBasics.actions.DirectionChangeActionId) {
            //self.dir = activity.direction();
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == REBasics.actions.MoveToAdjacentActionId) {

            const offset = Helpers.dirToTileOffset(activity.effectDirection());
            
            // Prepare event
            const args: WalkEventArgs = { walker: self, targetX: self.x + offset.x, targetY: self.y + offset.y };
            if (!REGame.eventServer.publish(context, REBasics.events.preWalk, args)) return SCommandResponse.Canceled;

            if (activity.isFastForward()) {
                this._straightDashing = true;
            }

            const layer = self.getHomeLayer();
            if (UMovement.moveEntity(context, self, self.x + offset.x, self.y + offset.y, MovingMethod.Walk, layer)) {
                context.postSequel(self, REBasics.sequels.MoveSequel);

                // 次の DialogOpen 時に足元の優先コマンドを表示したりする
                self.immediatelyAfterAdjacentMoving = true;
                this._requiredFeetProcess = true;
                
                return SCommandResponse.Handled;
            }
        }
        else if (activity.actionId() == REBasics.actions.performSkill) {
            if (activity.hasEffectDirection()) self.dir = activity.effectDirection();
            SEmittorPerformer.makeWithSkill(self, self, activity.skillId()).performe(context);
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == REBasics.actions.ForwardFloorActionId ||
            activity.actionId() == REBasics.actions.BackwardFloorActionId) {

            const reactor = activity.object();
            if (reactor) {
                context.post(reactor, self, subject, undefined, onProceedFloorReaction);
            }

        }
        else if (activity.actionId() == REBasics.actions.PickActionId) {
            const inventory = self.findEntityBehavior(LInventoryBehavior);
            if (inventory) {
                const block = REGame.map.block(self.x, self.y);
                const layer = block.layer(DBlockLayerKind.Ground);
                const itemEntity = layer.firstEntity();
                if (itemEntity) {
                    context.postHandleActivity(activity, itemEntity)
                    .then(() => {
                        REGame.map._removeEntity(itemEntity);

                        const gold = itemEntity.findEntityBehavior(LGoldBehavior);
                        if (gold) {
                            inventory.gainGold(gold.gold());
                            context.postDestroy(itemEntity);
                        }
                        else {
                            inventory.addEntityWithStacking(itemEntity);
                        }
                        
                        const name = LEntityDescription.makeDisplayText(UName.makeUnitName(self), DescriptionHighlightLevel.UnitName);
                        context.postMessage(tr("{0} は {1} をひろった", name, UName.makeNameAsItem(itemEntity)));
                        SSoundManager.playPickItem();
                        return SHandleCommandResult.Resolved;
                    });
                }
            }
        }
        else if (activity.actionId() == REBasics.actions.PutActionId) {
            
            // Prepare event
            const args: PutEventArgs = { actor: self };
            if (!REGame.eventServer.publish(context, REBasics.events.prePut, args)) return SCommandResponse.Canceled;

            const itemEntity = activity.object();//cmd.reactor();
            const inventory = self.findEntityBehavior(LInventoryBehavior);
            assert(itemEntity);
            assert(inventory);
            
            const block = REGame.map.block(self.x, self.y);
            const layer = block.layer(DBlockLayerKind.Ground);
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
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == REBasics.actions.ThrowActionId) {
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
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == REBasics.actions.ShootingActionId) {
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
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == REBasics.actions.ExchangeActionId) {
            
            const inventory = self.getEntityBehavior(LInventoryBehavior);
            const item1 = activity.object();
            const block = REGame.map.block(self.x, self.y);
            const layer = block.layer(DBlockLayerKind.Ground);
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
        else if (activity.actionId() == REBasics.actions.WaveActionId) {
            context.postSequel(self, REBasics.sequels.attack);

            const reactor = activity.object();
            if (reactor) {
                context.post(reactor, self, subject, undefined, onWaveReaction);
                // TODO: onWaveReaction 使ってない。onActivityReaction に共通化した。
            }
            
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == REBasics.actions.EatActionId) {
            context.postSequel(self, REBasics.sequels.useItem, activity.object());
            return SCommandResponse.Handled;
        }
        // [読む] ※↑の[振る] や EaterBehavior とほぼ同じ実装になっている。共通化したいところ。
        else if (activity.actionId() == REBasics.actions.ReadActionId) {
            context.postSequel(self, REBasics.sequels.useItem, activity.object());
            // 続いて onActivityReaction を実行する。
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == REBasics.actions.PutInActionId) {
            const selfInventory = self.getEntityBehavior(LInventoryBehavior);
            const storage = activity.object();
            const storageInventory = storage.getEntityBehavior(LInventoryBehavior);
            const items = activity.objects2();
            
            for (const item of items) {
                item.removeFromParent();
                storageInventory.addEntity(item);
                context.postMessage(tr("{0} を入れた。", UName.makeNameAsItem(item)));
            }
        }
        else if (activity.actionId() == REBasics.actions.talk) {
            const target = UAction.findTalkableFront(self);
            if (target) {
                context.postCall(() => {
                    target.iterateBehaviorsReverse(b => {
                        return b.onTalk(context, target, self) == SCommandResponse.Pass;
                    });
                });
            }
        }
        else if (activity.actionId() == REBasics.actions.dialogResult) {
            return SCommandResponse.Handled;    // 続いて onActivityReaction を実行する。
        }
        
        return SCommandResponse.Pass;
    }
    
    [onAttackReaction](args: CommandArgs, context: SCommandContext): SCommandResponse {
        const self = args.self;
        //const effectContext = cmd.effectContext();
        const effectContext: SEffectContext = args.args.effectContext;
        if (effectContext) {
            const targets = [self];
            effectContext.applyWithWorth(context, targets);


            
            if (!USearch.hasBlindness(self)) {
                // 相手が可視であれば、その方向を向く
                const subject = effectContext.effectorFact().subject();
                if (SView.getEntityVisibility(subject).visible) {
                    self.dir = UMovement.getLookAtDir(self, subject);
                }
            }

            for (const target of targets) {
                if (target._effectResult.isHit()) {
                    context.post(target, self, new SEffectSubject(effectContext.effectorFact().subject()), undefined, onDirectAttackDamaged);

                    
                }
            }

            

            context.postCall(() => {
                self.sendPartyEvent(REBasics.events.effectReacted, undefined);
            });

            return SCommandResponse.Handled;
        }
        
        return SCommandResponse.Pass;
    }


    [onWalkedOnTopAction](args: CommandArgs, context: SCommandContext): SCommandResponse {
        return SCommandResponse.Pass;
    }
    
    onTalk(context: SCommandContext, self: LEntity, person: LEntity): SCommandResponse {
        context.openDialog(self, new SEventExecutionDialog(self.rmmzEventId, self), false);
        return SCommandResponse.Pass;
    }
}
