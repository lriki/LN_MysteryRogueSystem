import { SCommand, SCommandResponse, SPhaseResult, STestAddItemCommand, STestTakeItemCommand } from "../../system/SCommand";
import { SCommandContext, SHandleCommandResult } from "../../system/SCommandContext";
import { CommandArgs, LBehavior, onAttackReaction, onDirectAttackDamaged, onProceedFloorReaction, onWalkedOnTopAction } from "./LBehavior";
import { MRLively } from "../MRLively";
import { LEntity } from "../LEntity";
import { Helpers } from "ts/mr/system/Helpers";
import { LInventoryBehavior } from "./LInventoryBehavior";
import { assert, MRSerializable, tr, tr2 } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import { UMovement } from "ts/mr/utility/UMovement";
import { SEffectContext, SEffectSubject } from "ts/mr/system/SEffectContext";
import { LActivity, LDashInfo, LDashType } from "../activities/LActivity";
import { DescriptionHighlightColor, LEntityDescription } from "../LIdentifyer";
import { SSoundManager } from "ts/mr/system/SSoundManager";
import { DFactionId, MRData } from "ts/mr/data/MRData";
import { MovingMethod } from "../LMap";
import { DecisionPhase, onGrounded, onPreStepFeetProcess_Actor } from "../internal";
import { PutEventArgs, WalkEventArgs } from "ts/mr/data/predefineds/DBasicEvents";
import { UName } from "ts/mr/utility/UName";
import { SEmittorPerformer } from "ts/mr/system/SEmittorPerformer";
import { SView } from "ts/mr/system/SView";
import { UAction } from "ts/mr/utility/UAction";
import { SEventExecutionDialog } from "ts/mr/system/dialogs/SEventExecutionDialog";
import { DActionId, DBlockLayerKind } from "ts/mr/data/DCommon";
import { LGoldBehavior } from "./LGoldBehavior";
import { USearch } from "ts/mr/utility/USearch";
import { SActivityContext } from "ts/mr/system/SActivityContext";
import { ULimitations } from "ts/mr/utility/ULimitations";
import { LTrapBehavior } from "./LTrapBehavior";
import { SFeetDialog } from "ts/mr/system/dialogs/SFeetDialog";
import { MRSystem } from "ts/mr/system/MRSystem";
import { LReaction } from "../LCommon";
import { TStumble } from "ts/mr/transactions/TStumble";
import { TThrow } from "ts/mr/transactions/TThrow";

enum LFeetProcess {
    None,
    Dialog,
    RideOnMessage,
    AutoPick,
}

/**
 * 
 */
@MRSerializable
export class LUnitBehavior extends LBehavior {
    
    private _factionId: DFactionId = MRData.system.factions.neutral;
    _speedLevel: number = 0;     // ユニットテスト用。 1 が基本, 0は無効値。2は倍速。3は3倍速。-1は鈍足。
    _waitTurnCount: number = 0;  // 内部パラメータ。待ち数。次のターン、行動できるかどうか。
    _manualMovement: boolean = false;    // マニュアル操作するかどうか。
    _targetingEntityId: number = 0;   // AIMinor Phase で、攻撃対象を確定したかどうか。以降、Run 内では iterationCount が残っていても MinorAction を行わない

    //_straightDashing: boolean = false;
    dashInfo: LDashInfo | undefined = undefined;
    _fastforwarding: boolean = false;
    
    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LUnitBehavior);
        b._factionId = this._factionId;
        b._speedLevel = this._speedLevel;
        b._waitTurnCount = this._waitTurnCount;
        b._manualMovement = this._manualMovement;
        b._targetingEntityId = this._targetingEntityId;
        b.dashInfo = this.dashInfo ? {...this.dashInfo} : undefined;
        b._fastforwarding = this._fastforwarding;
        return b;
    }

    override onInitialized(self: LEntity, params: unknown): void {
        if (params) {
            this.setFactionId((params as any).factionId);   // TODO: type
        }
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
        this.dashInfo = undefined;
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

    // queryCharacterFileName(): DPrefabActualImage | undefined {
    //     const self = this.ownerEntity();
    //     const e = self.data;
    //     const p = MRData.prefabs[e.prefabId];
        
    //     const image = { ...p.image };
    //     if (p.stateImages.length > 0) {
    //         self.iterateStates(s => {
    //             const i = p.stateImages.find(x => x.stateId == s.stateDataId());
    //             if (i) {
    //                 image.characterName = i.characterName;
    //                 image.characterIndex = i.characterIndex;
    //                 return false;
    //             }
    //             return true;
    //         });
    //     }

    //     return image;
    // }

    queryHomeLayer(): DBlockLayerKind | undefined {
        return DBlockLayerKind.Unit;
    }
    
    onQueryActions(actions: DActionId[]): DActionId[] {
        return actions.concat([
            MRBasics.actions.trample,
            MRBasics.actions.PickActionId,
            MRBasics.actions.PutActionId,
            //DBasics.actions.ExchangeActionId,
            MRBasics.actions.ThrowActionId,
            MRBasics.actions.ReadActionId,
            MRBasics.actions.ForwardFloorActionId,
            MRBasics.actions.BackwardFloorActionId,
        ]);
    }

    onQueryReactions(self: LEntity, reactions: LReaction[]): void {
        reactions.push({ actionId: MRBasics.actions.AttackActionId });
    }

    onEffectSensed(self: LEntity, cctx: SCommandContext): SCommandResponse { 
        this.dashInfo = undefined;
        return SCommandResponse.Pass;
     }

    onActivity(self: LEntity, cctx: SCommandContext, actx: SActivityContext): SCommandResponse {
        const subject = new SEffectSubject(self);
        const activity = actx.activity();

        if (self.traitsWithId(MRBasics.traits.SealActivity, activity.actionId()).length > 0) {
            cctx.postMessage(tr2("しかしなにもおこらなかった。"));
            return SCommandResponse.Canceled;
        }

        // 演出の処理
        {
            const action = MRData.skills[activity.actionId()];
            const name = LEntityDescription.makeDisplayText(UName.makeUnitName(self), DescriptionHighlightColor.UnitName);
            cctx.displayFlavorEffect(self, action.flavorEffect, {
                messageFormatArgs: [name],
                motionObjectEntity: activity.hasObject() ? activity.object() : undefined});
        }

        if (activity.entityDirection() > 0) {
            self.dir = activity.entityDirection();
        }

        if (activity.actionId() == MRBasics.actions.DirectionChangeActionId) {
            //self.dir = activity.direction();
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == MRBasics.actions.MoveToAdjacentActionId) {
            if (self.hasTrait(MRBasics.traits.DisableMovement)) {
                return SCommandResponse.Canceled;
            }

            const offset = Helpers.dirToTileOffset(activity.effectDirection());
            const startX = self.mx;
            const startY = self.my;
            
            // Prepare event
            const args: WalkEventArgs = { walker: self, targetX: self.mx + offset.x, targetY: self.my + offset.y };
            if (!MRLively.eventServer.publish(cctx, MRBasics.events.preWalk, args)) return SCommandResponse.Canceled;

            const dashInfo = activity.args();
            if (dashInfo && (dashInfo as LDashInfo)) {
                this.dashInfo = dashInfo;
            }

            const layer = self.getHomeLayer();

            if (UMovement.moveEntity(cctx, self, self.mx + offset.x, self.my + offset.y, MovingMethod.Walk, layer)) {
                cctx.postSequel(self, MRBasics.sequels.MoveSequel).setStartPosition(startX, startY);

                // Projectile の移動では通知したくないので、UMovement.moveEntity() の中ではなく Unit の移動側で通知する。
                MRLively.eventServer.publish(cctx, MRBasics.events.walked, args);

                // 次の DialogOpen 時に足元の優先コマンドを表示したりする
                self.immediatelyAfterAdjacentMoving = true;
                this._requiredFeetProcess = true;
                this._requiredTrapProcess = true;
                
                return SCommandResponse.Handled;
            }
        }
        else if (activity.actionId() == MRBasics.actions.performSkill) {
            if (activity.hasEffectDirection()) self.dir = activity.effectDirection();
            SEmittorPerformer.makeWithSkill(self, self, activity.skillId()).perform(cctx);
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == MRBasics.actions.ForwardFloorActionId ||
            activity.actionId() == MRBasics.actions.BackwardFloorActionId) {

            const reactor = activity.object();
            if (reactor) {
                cctx.post(reactor, self, subject, undefined, onProceedFloorReaction);
            }

        }
        else if (activity.actionId() == MRBasics.actions.PickActionId) {
            const inventory = self.findEntityBehavior(LInventoryBehavior);
            if (inventory) {
                const block = MRLively.mapView.currentMap.block(self.mx, self.my);
                const layer = block.layer(DBlockLayerKind.Ground);
                const itemEntity = layer.firstEntity();
                if (itemEntity) {
                    actx.postHandleActivity(cctx, itemEntity)
                    .then(() => {
                        const name = LEntityDescription.makeDisplayText(UName.makeUnitName(self), DescriptionHighlightColor.UnitName);

                        const gold = itemEntity.findEntityBehavior(LGoldBehavior);
                        if (gold) {
                            // お金だった
                            inventory.gainGold(gold.gold());
                            MRLively.mapView.currentMap._removeEntity(itemEntity);
                            cctx.postDestroy(itemEntity);
                            cctx.postMessage(tr2("%1は%2をひろった").format(name, UName.makeNameAsItem(itemEntity)));
                            SSoundManager.playPickItem();
                        }
                        else {
                            // 普通のアイテムだった
                            if (inventory.canAddEntityWithStacking(itemEntity)) {
                                MRLively.mapView.currentMap._removeEntity(itemEntity);
                                inventory.addEntityWithStacking(itemEntity);
                                cctx.postMessage(tr2("%1は%2をひろった").format(name, UName.makeNameAsItem(itemEntity)));
                                SSoundManager.playPickItem();
                            }
                            else {
                                cctx.postMessage(tr2("持ち物がいっぱいで拾えない。"));
                                cctx.postMessage(tr2("%1に乗った。").format(UName.makeNameAsItem(itemEntity)));
                            }
                        }

                        return SHandleCommandResult.Resolved;
                    });
                }
            }
        }
        else if (activity.actionId() == MRBasics.actions.PutActionId) {
            
            // Prepare event
            const args: PutEventArgs = { actor: self };
            if (!MRLively.eventServer.publish(cctx, MRBasics.events.prePut, args)) return SCommandResponse.Canceled;

            const itemEntity = activity.object();//cmd.reactor();
            const inventory = self.findEntityBehavior(LInventoryBehavior);
            assert(itemEntity);
            assert(inventory);
            
            const block = MRLively.mapView.currentMap.block(self.mx, self.my);
            const layer = block.layer(DBlockLayerKind.Ground);
            // 足元に置けそうなら試行
            if (!layer.isContainsAnyEntity()) {
                cctx.postCommandTask(new STestTakeItemCommand(itemEntity, self))
                    .then2(() => {
                        if (ULimitations.isItemCountFullyInMap()) {
                            cctx.postMessage(tr2("不思議な力で行動できなかった。"));
                        }
                        else {
                            itemEntity.removeFromParent();
                            MRLively.mapView.currentMap.appearEntity(itemEntity, self.mx, self.my);

                            cctx.postMessage(tr("{0} を置いた。", UName.makeNameAsItem(itemEntity)));
                            cctx.post(itemEntity, self, subject, undefined, onGrounded);
                        }
                    });
            }
            else {
                cctx.postMessage(tr("置けなかった。"));
            }
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == MRBasics.actions.ThrowActionId) {
            // FIXME: [撃つ] とかなり似ているので、長くなるようならまとめたほうがいいかも

            TThrow.throwAllStack(cctx, self, self, activity.object());
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == MRBasics.actions.ShootActionId) {
            TThrow.throwSingleStack(cctx, self, self, activity.object());
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == MRBasics.actions.ExchangeActionId) {
            
            const inventory = self.getEntityBehavior(LInventoryBehavior);
            const item1 = activity.object();
            const block = MRLively.mapView.currentMap.block(self.mx, self.my);
            const layer = block.layer(DBlockLayerKind.Ground);
            const item2 = layer.firstEntity();
            if (item2) {
                // TODO: 呪いの処理など、アイテムを今いる場所から取り外せるかチェック入れる

                MRLively.mapView.currentMap._removeEntity(item2);
                inventory.removeEntity(item1);

                MRLively.mapView.currentMap.appearEntity(item1, self.mx, self.my);
                inventory.addEntity(item2);

                cctx.postMessage(tr("{0} と {1} を交換した。", UName.makeNameAsItem(item1), UName.makeNameAsItem(item2)));
                SSoundManager.playPickItem();
            }
            else {
                cctx.postMessage(tr2("足元には何もない。"));
            }

        }
        else if (activity.actionId() == MRBasics.actions.WaveActionId) {
            cctx.postSequel(self, MRBasics.sequels.attack);
            actx.postHandleActivity(cctx, activity.object());
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == MRBasics.actions.EatActionId) {
            cctx.postSequel(self, MRBasics.sequels.useItem, undefined, undefined, activity.object());
            actx.postHandleActivity(cctx, activity.object());
            return SCommandResponse.Handled;
        }
        // [読む] ※↑の[振る] や EaterBehavior とほぼ同じ実装になっている。共通化したいところ。
        else if (activity.actionId() == MRBasics.actions.ReadActionId) {
            cctx.postSequel(self, MRBasics.sequels.useItem, undefined, undefined, activity.object());
            actx.postHandleActivity(cctx, activity.object());
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == MRBasics.actions.PutInActionId) {
            const selfInventory = self.getEntityBehavior(LInventoryBehavior);
            const storage = activity.object();
            const storageInventory = storage.getEntityBehavior(LInventoryBehavior);
            const items = activity.objects2();
            
            for (const item of items) {
                cctx.postCommandTask(new STestTakeItemCommand(item, self))  // item を取り出せる？
                    .thenCommandTask(new STestAddItemCommand(storage, item))   // item を格納できる？
                    .then2(c => {
                        item.removeFromParent();
                        storageInventory.addEntity(item);
                        cctx.postMessage(tr("{0} に {1} を入れた。", UName.makeNameAsItem(storage), UName.makeNameAsItem(item)));
                    });
                // item.removeFromParent();
                // storageInventory.addEntity(item);
                // cctx.postMessage(tr("{0} に {1} を入れた。", UName.makeNameAsItem(storage), UName.makeNameAsItem(item)));
            }
        }
        else if (activity.actionId() == MRBasics.actions.PickOutActionId) {
            const selfInventory = self.getEntityBehavior(LInventoryBehavior);
            for (const item of activity.objects2()) {
                cctx.postCommandTask(new STestTakeItemCommand(item, self))  // item を取り出せる？
                    .thenCommandTask(new STestAddItemCommand(self, item))   // item を格納できる？
                    .then2(c => {
                        item.removeFromParent();
                        selfInventory.addEntity(item);
                        cctx.postMessage(tr("{0} を取り出した。", UName.makeNameAsItem(item)));
                    });
            }

            //PickOutActionId
        }
        else if (activity.actionId() == MRBasics.actions.talk) {
            const target = UAction.findTalkableFront(self);
            if (target) {
                cctx.postCall(() => {
                    target.iterateBehaviorsReverse(b => {
                        return b.onTalk(target, cctx, self) == SCommandResponse.Pass;
                    });
                });
            }
        }
        else if (activity.actionId() == MRBasics.actions.dialogResult) {
            actx.postHandleActivity(cctx, activity.object());
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == MRBasics.actions.stumble) {
            TStumble.postStumble(cctx, self, self.dir);
            //return SCommandResponse.Handled;
        }
        else if (activity.actionId() == MRBasics.actions.trample) {
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
                    self.sendPartyEvent(MRBasics.events.effectReacted, undefined);
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
            MRSystem.sequelContext.trapPerforming = true;
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
                    cctx.openDialog(self, new SFeetDialog(self, targetEntity), false);
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
                MRSystem.sequelContext.attemptFlush(true);
                cctx.postActivity(LActivity.makePick(self));
                break;
            default:
                throw new Error("Unreachable.");
        }

        return SCommandResponse.Pass;
    }

    // 歩行移動時、足元に何かアクションを行えるものがあれば、そのアクションをチェックする。
    private judgeFeetProcess(self: LEntity): [LFeetProcess, LEntity | undefined] {
        if (this._manualMovement) {
            if (self.immediatelyAfterAdjacentMoving) {
                const targetEntity = MRLively.mapView.currentMap.firstFeetEntity(self);
                if (targetEntity && !targetEntity.findEntityBehavior(LTrapBehavior)) {
                    const reactions = targetEntity.queryReactions();
                    if (reactions.length > 0) {
                        if (!!reactions.find(x => x.actionId == MRBasics.actions.PickActionId) &&
                            !targetEntity._shopArticle.isSalling()) {
                            if (this.dashInfo && this.dashInfo.type == LDashType.StraightDash) {
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
        return [LFeetProcess.None, undefined];
    }
    
    onTalk(self: LEntity, cctx: SCommandContext, person: LEntity): SCommandResponse {
        cctx.openDialog(self, new SEventExecutionDialog(self.rmmzEventId, self, person), false);
        return SCommandResponse.Pass;
    }

    
    onDecisionPhase(self: LEntity, cctx: SCommandContext, phase: DecisionPhase): SPhaseResult {
        
        if (phase == DecisionPhase.ResolveAdjacentAndMovingTarget) {
            

            return SPhaseResult.Pass;
        }

        return SPhaseResult.Pass;
    }

    
}
