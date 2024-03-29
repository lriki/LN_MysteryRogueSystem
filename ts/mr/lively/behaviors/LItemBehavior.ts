import { assert, MRSerializable } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import { DItem, DItemDataId } from "ts/mr/data/DItem";
import { MRData } from "ts/mr/data/MRData";
import { SCommand, SCommandResponse, SItemReactionCommand } from "ts/mr/system/SCommand";
import { MRSystem } from "ts/mr/system/MRSystem";
import { SCommandContext, SHandleCommandResult } from "ts/mr/system/SCommandContext";
import { SEffectContext, SEffectSubject } from "ts/mr/system/SEffectContext";
import { SEmittorPerformer, SOnPerformedFunc } from "ts/mr/system/SEmittorPerformer";
import { UIdentify } from "ts/mr/utility/UIdentify";
import { LActivity } from "../activities/LActivity";
import { LStructureId } from "../LCommon";
import { LEntity, LParamMinMax } from "../entity/LEntity";
import { MRLively } from "../MRLively";
import { CommandArgs, LBehavior, onAttackReaction } from "./LBehavior";
import { UAction } from "ts/mr/utility/UAction";
import { SActivityContext } from "ts/mr/system/SActivityContext";
import { DActionId } from "ts/mr/data/DCommon";
import { SSubTaskChain, STaskYieldResult } from "ts/mr/system/tasks/STask";
import { TDrop } from "ts/mr/transactions/TDrop";


/**
 * Item として表現する Entity の共通 Behavior
 */
@MRSerializable
export class LItemBehavior extends LBehavior {
    private _shopStructureId: LStructureId = 0;

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LItemBehavior);
        return b;
    }

    public constructor() {
        super();
    }

    // public itemDataId(): DItemDataId {
    //     const entity = this.ownerEntity().data();
    //     assert(entity.itemData);
    //     return entity.itemData.id;
    // }

    // public itemData(): DItem {
    //     const entity = this.ownerEntity().data();
    //     assert(entity.itemData);
    //     return entity.itemData;
    // }

    public shopStructureId(): LStructureId {
        return this._shopStructureId;
    }

    public setShopStructureId(value: LStructureId): void {
        this._shopStructureId = value;
    }

    // public onQueryParamMinMax(paramId: DParameterId, result: LParamMinMaxInfo): void {
    //     const self = this.ownerEntity();
    //     if (self.params().param(paramId) !== undefined) {
    //         if (paramId == REBasics.params.upgradeValue) {
                
    //         }
    //     }
    // }

    override *onCommand(self: LEntity, cctx: SCommandContext, cmd: SCommand): Generator<STaskYieldResult> {
        if (cmd instanceof SItemReactionCommand) {
            if (cmd.itemActionId == MRBasics.actions.collide) {

                // TODO: このあたり、 Reaction 関係の処理は Common に移動していいかも。
                //       destroy の有無は Reaction 側に付ける。
                //       これによって、単に１ダメ与えてロストするようなのをやめることもできる。
                
                const hasReaction = this.applyHitEffect(cctx, self, MRBasics.actions.collide, cmd.target, cmd.subject, cmd.direction, (targets: LEntity[]) => {
                    if (targets.find(x => !x._effectResult.missed)) {
                        // ここは postDestroy() ではなく普通の destroy().
                        // 上記 applyEffect() の中から postAnimation() が実行されるが、
                        // ここで postDestroy() してしまうと、アニメーション中ずっと表示され続けてしまう。
                        self.destroy();
                    }
                    else {
                        UAction.postDropOrDestroy(cctx, self, self.mx, self.my);
                    }
                });

                if (!hasReaction) {
                    TDrop.makeFromSingleItem(self)
                        .withLocation(cmd.target.mx, cmd.target.my)
                        .performe(cctx);
                }
                //chain.accept();
            }
        }
    }

    onCollectTraits(self: LEntity, result: IDataTrait[]): void {
        super.onCollectTraits(self, result);
        for (const trait of self.data.selfTraits){
            result.push(trait);
        }
    }

    /*
    onActivity(self: LEntity, cctx: SCommandContext, actx: SActivityContext): SCommandResponse {
        const activity = actx.activity();
        if (activity.actionId() == MRBasics.actions.collide) {
    
            
            const target = activity.objects2()[0];
            const subject = new SEffectSubject(activity.subject());
            actx.postHandleActivity(cctx, target)
            .then(() => {
                this.applyHitEffect(cctx, self, MRBasics.actions.collide, target, subject.entity(), activity.effectDirection(), (targets: LEntity[]) => {
                    if (targets.find(x => !x._effectResult.missed)) {
                        // ここは postDestroy() ではなく普通の destroy().
                        // 上記 applyEffect() の中から postAnimation() が実行されるが、
                        // ここで postDestroy() してしまうと、アニメーション中ずっと表示され続けてしまう。
                        self.destroy();
                    }
                    else {
                        UAction.postDropOrDestroy(cctx, self, self.mx, self.my);
                    }
                });
                return SHandleCommandResult.Resolved;
            })
            .catch(() => {
                throw new Error("Not implemented.");
            });
            
            return SCommandResponse.Handled;
        }

        return SCommandResponse.Pass;
    }
    */


    onActivityReaction(self: LEntity, cctx: SCommandContext, activity: LActivity): SCommandResponse {
        // [振られた]
        if (activity.actionId() == MRBasics.actions.WaveActionId) {
            const actor = activity.actor();
            const reaction = self.data.getReaction(MRBasics.actions.WaveActionId);
            for (const emittor of reaction.emittors()) {
                SEmittorPerformer.makeWithEmitor(actor, actor, emittor)
                    .setItemEntity(self)
                    .perform(cctx);
            }
        }
        // [読まれた]
        else if (activity.actionId() == MRBasics.actions.ReadActionId) {
            const actor = activity.actor();
            UIdentify.identifyByTiming(cctx, actor, self, activity.actionId());
            const reaction = self.data.getReaction(MRBasics.actions.ReadActionId);
            for (const emittor of reaction.emittors()) {
                SEmittorPerformer.makeWithEmitor(actor, actor, emittor)
                    .setItemEntity(self)
                    .setSelectedTargetItems(activity.objects2())
                    .perform(cctx);
                cctx.postDestroy(self);
            }
        }
        // [食べられた]
        else if (activity.actionId() == MRBasics.actions.EatActionId) {
            
            const subject = activity.actor();
            const reactor = activity.object();
            if (reactor) {
                UIdentify.identifyByTiming(cctx, subject, reactor, activity.actionId());


                const reaction = self.data.getReaction(MRBasics.actions.EatActionId);
                for (const emittor of reaction.emittors()) {
                    SEmittorPerformer.makeWithEmitor(subject, subject, emittor)
                        .setItemEntity(self)
                        .setSelectedTargetItems(activity.objects2())
                        .perform(cctx);

                    // 食べられたので削除。
                    // [かじる] も [食べる] の一部として考えるような場合は Entity が削除されることは無いので、
                    // actor 側で destroy するのは望ましくない。
                    cctx.postDestroy(self);
                }


                //cctx.post(reactor, subject, new SEffectSubject(subject), undefined, onEatReaction);
            }
            
            return SCommandResponse.Handled;
        }

        return SCommandResponse.Pass;
    }

    
    onEmitEffect(self: LEntity, cctx: SCommandContext, actionId: DActionId, subject: LEntity, target: LEntity, dir: number): SCommandResponse {
        this.applyHitEffect(cctx, self, actionId, target, subject, dir);
        return SCommandResponse.Pass;
    }

    private applyHitEffect(cctx: SCommandContext, self: LEntity, actionId: DActionId, target: LEntity, subject: LEntity, effectDir: number, onPerformedFunc?: SOnPerformedFunc): boolean {
        const entityData = self.data;
        //const emittors = entityData.emittorSet.emittors(cause);
        const reaction = entityData.findReaction(actionId);
        if (reaction) {
            const emittors = reaction.emittors();
            if (emittors.length > 0) {
                cctx.postCall(() => {
                    for (const emittor of emittors) {
                        //SEmittorPerformer.makeWithEmitor(subject.entity(), emittor)
                        SEmittorPerformer.makeWithEmitor(subject, target, emittor)
                            .setItemEntity(self)
                            .setDffectDirection(effectDir)
                            .perform(cctx, onPerformedFunc);
                    }
                });
            }
            return true;
        }
        else {
            // 吹き飛ばした Enemy が他 Enemy と衝突した場合など、Reaction を持たない場合
            return false;
        }
    }

    
    // TODO: すごく仮。今はアイテムが盗みスキルの効果を受け取るためだけにある
    [onAttackReaction](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
        const self = args.self;
        const effectContext: SEffectContext = args.args.effectContext;
        if (effectContext) {
            const targets = [self];
            effectContext.applyWithWorth(cctx, targets);

            return SCommandResponse.Handled;
        }
        
        return SCommandResponse.Pass;
    }

    // onStabilizeSituation(self: LEntity, cctx: SCommandContext): SCommandResponse {
    //     if (self.isDeathStateAffected()) {
    //         cctx.postSequel(self, REBasics.sequels.CollapseSequel);
    //         cctx.postDestroy(self);
    //         return SCommandResponse.Handled;
    //     }
        
    //     return SCommandResponse.Pass;
    // }
}

