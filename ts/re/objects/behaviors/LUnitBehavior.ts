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
import { DecisionPhase, onGrounded, onPreStepFeetProcess, onPreStepFeetProcess_Actor, testPutInItem } from "../internal";
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
import { SActivityContext } from "ts/re/system/SActivityContext";
import { ULimitations } from "ts/re/usecases/ULimitations";
import { LTrapBehavior } from "./LTrapBehavior";
import { LFeetDialog } from "ts/re/system/dialogs/SFeetDialog";
import { RESystem } from "ts/re/system/RESystem";

enum LFeetProcess {
    None,
    Dialog,
    RideOnMessage,
    AutoPick,
}

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

    public clearStraightDashing(): void {
        this._straightDashing = false;
    }



    // 歩行移動したため、足元にある Entity に対して処理が必要かどうか。
    // アイテムを拾おうとしたり、罠の起動判定を行ったりする。
    private _requiredFeetProcess: boolean = false;
    private _requiredTrapProcess: boolean = false;





    
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

    public requiredTrapProcess(): boolean {
        return this._requiredTrapProcess;
    }
    
    public clearTrapProcess(): void {
        this._requiredTrapProcess = false;
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

    onEffectSensed(self: LEntity, cctx: SCommandContext): SCommandResponse { 
        this._straightDashing = false;
        return SCommandResponse.Pass;
     }

    onActivity(self: LEntity, cctx: SCommandContext, actx: SActivityContext): SCommandResponse {
        const subject = new SEffectSubject(self);
        const activity = actx.activity();

        if (self.traitsWithId(REBasics.traits.SealActivity, activity.actionId()).length > 0) {
            cctx.postMessage(tr2("しかしなにもおこらなかった。"));
            return SCommandResponse.Canceled;
        }


        if (activity.entityDirection() > 0) {
            self.dir = activity.entityDirection();
        }

        if (activity.actionId() == REBasics.actions.DirectionChangeActionId) {
            //self.dir = activity.direction();
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == REBasics.actions.MoveToAdjacentActionId) {

            const offset = Helpers.dirToTileOffset(activity.effectDirection());
            const startX = self.mx;
            const startY = self.my;
            
            // Prepare event
            const args: WalkEventArgs = { walker: self, targetX: self.mx + offset.x, targetY: self.my + offset.y };
            if (!REGame.eventServer.publish(cctx, REBasics.events.preWalk, args)) return SCommandResponse.Canceled;

            if (activity.isFastForward()) {
                this._straightDashing = true;
            }

            const layer = self.getHomeLayer();

            if (UMovement.moveEntity(cctx, self, self.mx + offset.x, self.my + offset.y, MovingMethod.Walk, layer)) {
                cctx.postSequel(self, REBasics.sequels.MoveSequel).setStartPosition(startX, startY);

                // Projectile の移動では通知したくないので、UMovement.moveEntity() の中ではなく Unit の移動側で通知する。
                REGame.eventServer.publish(cctx, REBasics.events.walked, args);

                // 次の DialogOpen 時に足元の優先コマンドを表示したりする
                self.immediatelyAfterAdjacentMoving = true;
                this._requiredFeetProcess = true;
                this._requiredTrapProcess = true;
                
                return SCommandResponse.Handled;
            }
        }
        else if (activity.actionId() == REBasics.actions.performSkill) {
            if (activity.hasEffectDirection()) self.dir = activity.effectDirection();
            SEmittorPerformer.makeWithSkill(self, self, activity.skillId()).perform(cctx);
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == REBasics.actions.ForwardFloorActionId ||
            activity.actionId() == REBasics.actions.BackwardFloorActionId) {

            const reactor = activity.object();
            if (reactor) {
                cctx.post(reactor, self, subject, undefined, onProceedFloorReaction);
            }

        }
        else if (activity.actionId() == REBasics.actions.PickActionId) {
            const inventory = self.findEntityBehavior(LInventoryBehavior);
            if (inventory) {
                const block = REGame.map.block(self.mx, self.my);
                const layer = block.layer(DBlockLayerKind.Ground);
                const itemEntity = layer.firstEntity();
                if (itemEntity) {
                    actx.postHandleActivity(cctx, itemEntity)
                    .then(() => {
                        const name = LEntityDescription.makeDisplayText(UName.makeUnitName(self), DescriptionHighlightLevel.UnitName);

                        const gold = itemEntity.findEntityBehavior(LGoldBehavior);
                        if (gold) {
                            // お金だった
                            inventory.gainGold(gold.gold());
                            REGame.map._removeEntity(itemEntity);
                            cctx.postDestroy(itemEntity);
                            cctx.postMessage(tr2("%1は%2をひろった").format(name, UName.makeNameAsItem(itemEntity)));
                            SSoundManager.playPickItem();
                        }
                        else {
                            // 普通のアイテムだった
                            if (inventory.isFully) {
                                cctx.postMessage(tr2("持ち物がいっぱいで拾えない。"));
                                cctx.postMessage(tr2("%1に乗った。").format(UName.makeNameAsItem(itemEntity)));
                            }
                            else {
                                REGame.map._removeEntity(itemEntity);
                                inventory.addEntityWithStacking(itemEntity);
                                cctx.postMessage(tr2("%1は%2をひろった").format(name, UName.makeNameAsItem(itemEntity)));
                                SSoundManager.playPickItem();
                            }
                        }

                        return SHandleCommandResult.Resolved;
                    });
                }
            }
        }
        else if (activity.actionId() == REBasics.actions.PutActionId) {
            
            // Prepare event
            const args: PutEventArgs = { actor: self };
            if (!REGame.eventServer.publish(cctx, REBasics.events.prePut, args)) return SCommandResponse.Canceled;

            const itemEntity = activity.object();//cmd.reactor();
            const inventory = self.findEntityBehavior(LInventoryBehavior);
            assert(itemEntity);
            assert(inventory);
            
            const block = REGame.map.block(self.mx, self.my);
            const layer = block.layer(DBlockLayerKind.Ground);
            if (!layer.isContainsAnyEntity()) {
                // 足元に置けそうなら試行
                cctx.post(itemEntity, self, subject, undefined, testPickOutItem)
                    .then(() => {
                        if (ULimitations.isItemCountFullyInMap()) {
                            cctx.postMessage(tr2("不思議な力で行動できなかった。"));
                            return true;
                        }
                        else {
                            itemEntity.removeFromParent();
                            //cctx.remo
                            //inventory.removeEntity(itemEntity);
                            REGame.map.appearEntity(itemEntity, self.mx, self.my);
    
                            cctx.postMessage(tr("{0} を置いた。", UName.makeNameAsItem(itemEntity)));
                            cctx.post(itemEntity, self, subject, undefined, onGrounded);
                            return true;
                        }
                    });
            }
            else {
                cctx.postMessage(tr("置けなかった。"));
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

            cctx.post(itemEntity, self, subject, undefined, onPreThrowReaction)
                .then(() => {
                    //itemEntity.callRemoveFromWhereabouts(cctx);

                    itemEntity.removeFromParent();
                    itemEntity.mx = self.mx;
                    itemEntity.my = self.my;

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


                    cctx.post(itemEntity, self, subject, undefined, onThrowReaction)
                        .then(() => {
                            cctx.postMessage(tr("{0} を投げた。", UName.makeNameAsItem(itemEntity)));
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

            cctx.post(itemEntity, self, subject, undefined, onPreThrowReaction)
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

                    actual.mx = self.mx;
                    actual.my = self.my;


                    cctx.post(actual, self, subject, undefined, onThrowReaction)
                        .then(() => {
                            cctx.postMessage(tr("{0} を撃った", UName.makeNameAsItem(actual)));
                            return true;
                        });

                    return true;
                });
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == REBasics.actions.ExchangeActionId) {
            
            const inventory = self.getEntityBehavior(LInventoryBehavior);
            const item1 = activity.object();
            const block = REGame.map.block(self.mx, self.my);
            const layer = block.layer(DBlockLayerKind.Ground);
            const item2 = layer.firstEntity();
            if (item2) {
                // TODO: 呪いの処理など、アイテムを今いる場所から取り外せるかチェック入れる

                REGame.map._removeEntity(item2);
                inventory.removeEntity(item1);

                REGame.map.appearEntity(item1, self.mx, self.my);
                inventory.addEntity(item2);

                cctx.postMessage(tr("{0} と {1} を交換した。", UName.makeNameAsItem(item1), UName.makeNameAsItem(item2)));
                SSoundManager.playPickItem();
            }
            else {
                cctx.postMessage(tr2("足元には何もない。"));
            }

        }
        else if (activity.actionId() == REBasics.actions.WaveActionId) {
            cctx.postSequel(self, REBasics.sequels.attack);

            const reactor = activity.object();
            if (reactor) {
                cctx.post(reactor, self, subject, undefined, onWaveReaction);
                // TODO: onWaveReaction 使ってない。onActivityReaction に共通化した。
            }
            
            actx.postHandleActivity(cctx, activity.object());
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == REBasics.actions.EatActionId) {
            cctx.postSequel(self, REBasics.sequels.useItem, undefined, undefined, activity.object());
            actx.postHandleActivity(cctx, activity.object());
            return SCommandResponse.Handled;
        }
        // [読む] ※↑の[振る] や EaterBehavior とほぼ同じ実装になっている。共通化したいところ。
        else if (activity.actionId() == REBasics.actions.ReadActionId) {
            cctx.postSequel(self, REBasics.sequels.useItem, undefined, undefined, activity.object());
            actx.postHandleActivity(cctx, activity.object());
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
                cctx.postMessage(tr("{0} を入れた。", UName.makeNameAsItem(item)));
            }
        }
        else if (activity.actionId() == REBasics.actions.talk) {
            const target = UAction.findTalkableFront(self);
            if (target) {
                cctx.postCall(() => {
                    target.iterateBehaviorsReverse(b => {
                        return b.onTalk(target, cctx, self) == SCommandResponse.Pass;
                    });
                });
            }
        }
        else if (activity.actionId() == REBasics.actions.dialogResult) {
            actx.postHandleActivity(cctx, activity.object());
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == REBasics.actions.stumble) {
            UAction.postStumble(cctx, self, self.dir);
            //return SCommandResponse.Handled;
        }
        else if (activity.actionId() == REBasics.actions.trample) {
            const target = USearch.getFirstUnderFootEntity(self);
            if (target) {
                actx.postHandleActivity(cctx, target);
                return SCommandResponse.Handled;
            }
        }
        
        return SCommandResponse.Pass;
    }
    
    [onAttackReaction](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
        const self = args.self;
        //const effectContext = cmd.effectContext();
        const effectContext: SEffectContext = args.args.effectContext;
        if (effectContext) {
            const targets = [self];
            effectContext.applyWithWorth(cctx, targets)
            .then(() => {

                if (!USearch.hasBlindness(self)) {
                    // 相手が可視であれば、その方向を向く
                    const subject = effectContext.effectorFact().subject();
                    if (SView.getEntityVisibility(subject).visible) {
                        self.dir = UMovement.getLookAtDir(self, subject);
                    }
                }
    
                for (const target of targets) {
                    if (target._effectResult.isHit()) {
                        cctx.post(target, self, new SEffectSubject(effectContext.effectorFact().subject()), undefined, onDirectAttackDamaged);
    
                        
                    }
                }
    
                
    
                cctx.postCall(() => {
                    self.sendPartyEvent(REBasics.events.effectReacted, undefined);
                });

                return true;
            });



            return SCommandResponse.Handled;
        }
        
        return SCommandResponse.Pass;
    }

    
    [onPreStepFeetProcess_Actor](e: CommandArgs, cctx: SCommandContext): SCommandResponse {
        const self = this.ownerEntity();

        const [result, targetEntity] = this.judgeFeetProcess(self);
        if (result == LFeetProcess.Dialog) {
            RESystem.sequelContext.trapPerforming = true;
        }

        return SCommandResponse.Pass;
    }

    [onWalkedOnTopAction](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
        const self = this.ownerEntity();

        const [result, targetEntity] = this.judgeFeetProcess(self);
        switch (result) {
            case LFeetProcess.None:
                break;
            case LFeetProcess.Dialog:
                if (targetEntity) {
                    cctx.openDialog(self, new LFeetDialog(targetEntity), false);
                }
                break;
            case LFeetProcess.RideOnMessage:
                if (targetEntity) {
                    cctx.postMessage(tr2("%1 に乗った。").format(UName.makeNameAsItem(targetEntity)));
                }
                break;
            case LFeetProcess.AutoPick:
                // 歩行による自動拾得から実行される場合、この時点では Sequel は Flush されていないことがある。
                // v0.5.0 時点では Pick のハンドリングでは REGame.map._removeEntity() を直接実行しているので、
                // その前に Flush しておかないと、移動前にいきなり Item が消えたように見えてしまう。
                RESystem.sequelContext.attemptFlush(true);
                cctx.postActivity(LActivity.makePick(self));
                break;
            default:
                throw new Error("Unreachable.");
        }

        return SCommandResponse.Pass;

        /*
        if (this._manualMovement) {
            const self = this.ownerEntity();
            if (self.immediatelyAfterAdjacentMoving) {
                self.immediatelyAfterAdjacentMoving = false;
    
                const targetEntity = REGame.map.firstFeetEntity(self);
                if (targetEntity && !targetEntity.findEntityBehavior(LTrapBehavior)) {
                    const actions = targetEntity.queryReactions();
                    if (actions.length > 0) {
    
                        if (actions.includes(REBasics.actions.PickActionId) &&
                            !targetEntity._shopArticle.isSalling()) {
        
                            if (this._straightDashing) {
                                cctx.postMessage(tr2("%1 に乗った。").format(UName.makeNameAsItem(targetEntity)));
                            }
                            else {
                                // 歩行移動時に足元に拾えるものがあれば取得試行
                                
                                // 歩行による自動拾得から実行される場合、この時点では Sequel は Flush されていないことがある。
                                // v0.5.0 時点では Pick のハンドリングでは REGame.map._removeEntity() を直接実行しているので、
                                // その前に Flush しておかないと、移動前にいきなり Item が消えたように見えてしまう。
                                RESystem.sequelContext.attemptFlush(true);

                                cctx.postActivity(LActivity.makePick(self));
                            }
        
        
                            // コマンドチェーンを動かす
                            //context.postReopen();
                        }
                        else {
                            cctx.openDialog(self, new LFeetDialog(targetEntity), false);
                        }
                        //return SPhaseResult.Pass;
                    }
                }
            }
        }
        return SCommandResponse.Pass;
        */

    }

    
    private judgeFeetProcess(self: LEntity): [LFeetProcess, LEntity | undefined] {
        if (this._manualMovement) {
            if (self.immediatelyAfterAdjacentMoving) {
                const targetEntity = REGame.map.firstFeetEntity(self);
                if (targetEntity && !targetEntity.findEntityBehavior(LTrapBehavior)) {
                    const actions = targetEntity.queryReactions();
                    if (actions.length > 0) {
                        const actions = targetEntity.queryReactions();
                        if (actions.length > 0) {
                            if (actions.includes(REBasics.actions.PickActionId) &&
                                !targetEntity._shopArticle.isSalling()) {
                                if (this._straightDashing) {
                                    return [LFeetProcess.RideOnMessage, targetEntity];
                                }
                                else {
                                    // 歩行移動時に足元に拾えるものがあれば取得試行
                                    return [LFeetProcess.AutoPick, targetEntity];
                                }
                            }
                            else {
                                return [LFeetProcess.Dialog, targetEntity];
                            }
                        }
                    }
                }
            }
        }
        return [LFeetProcess.None, undefined];
    }
    
    onTalk(self: LEntity, cctx: SCommandContext, person: LEntity): SCommandResponse {
        cctx.openDialog(self, new SEventExecutionDialog(self.rmmzEventId, self), false);
        return SCommandResponse.Pass;
    }

    
    onDecisionPhase(self: LEntity, cctx: SCommandContext, phase: DecisionPhase): SPhaseResult {
        
        if (phase == DecisionPhase.ResolveAdjacentAndMovingTarget) {
            

            return SPhaseResult.Pass;
        }

        return SPhaseResult.Pass;
    }

    
}
