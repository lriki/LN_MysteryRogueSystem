import { assert } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { DEffectCause } from "ts/re/data/DEmittor";
import { DIdentifiedTiming } from "ts/re/data/DIdentifyer";
import { DItem, DItemDataId } from "ts/re/data/DItem";
import { REData } from "ts/re/data/REData";
import { SCommandResponse } from "ts/re/system/RECommand";
import { RESystem } from "ts/re/system/RESystem";
import { SCommandContext, SHandleCommandResult } from "ts/re/system/SCommandContext";
import { SEffectContext, SEffectSubject } from "ts/re/system/SEffectContext";
import { SEmittorPerformer, SOnPerformedFunc } from "ts/re/system/SEmittorPerformer";
import { UIdentify } from "ts/re/usecases/UIdentify";
import { LActivity } from "../activities/LActivity";
import { LStructureId } from "../LCommon";
import { LEntity, LParamMinMax } from "../LEntity";
import { REGame } from "../REGame";
import { CollideActionArgs, CommandArgs, LBehavior, LParamMinMaxInfo, onAttackReaction, onCollideAction, onEatReaction } from "./LBehavior";
import { UAction } from "ts/re/usecases/UAction";
import { DParameterId } from "ts/re/data/DParameter";
import { SActivityContext } from "ts/re/system/SActivityContext";


/**
 * Item として表現する Entity の共通 Behavior
 */
export class LItemBehavior extends LBehavior {
    private _shopStructureId: LStructureId = 0;

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LItemBehavior);
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


    onCollectTraits(self: LEntity, result: IDataTrait[]): void {
        super.onCollectTraits(self, result);
        for (const trait of self.data().selfTraits){
            result.push(trait);
        }
    }

    onActivity(self: LEntity, cctx: SCommandContext, actx: SActivityContext): SCommandResponse {
        const activity = actx.activity();
        if (activity.actionId() == REBasics.actions.collide) {
    
            
            const target = activity.objects2()[0];
            const subject = new SEffectSubject(activity.subject());
            actx.postHandleActivity(cctx, target)
            .then(() => {
                this.applyEffect(cctx, self, target, subject, DEffectCause.Hit, activity.effectDirection(), (targets: LEntity[]) => {
                    if (targets.find(x => !x._effectResult.missed)) {
                        cctx.postDestroy(self);
                        console.log("Hit");
                    }
                    else {
                        UAction.postDropOrDestroy(cctx, self, self.x, self.y);
                        console.log("MISS");
                    }
                });
                return SHandleCommandResult.Resolved;
            })
            .catch(() => {
                console.log("catch");
                throw new Error("Not implemented.");
            });
            
            return SCommandResponse.Handled;
        }

        return SCommandResponse.Pass;
    }

    onActivityReaction(self: LEntity, cctx: SCommandContext, activity: LActivity): SCommandResponse {
        // [振られた]
        if (activity.actionId() == REBasics.actions.WaveActionId) {
            const actor = activity.actor();
            const reactions = self.data().reactions.filter(x => x.actionId == REBasics.actions.WaveActionId);
            for (const reaction of reactions) {
                SEmittorPerformer.makeWithEmitor(actor, actor, REData.getEmittorById(reaction.emittingEffect))
                    .setItemEntity(self)
                    .perform(cctx);
            }
        }
        // [読まれた]
        else if (activity.actionId() == REBasics.actions.ReadActionId) {
            const actor = activity.actor();
            UIdentify.identifyByTiming(cctx, actor, self, DIdentifiedTiming.Read);

            const reactions = self.data().reactions.filter(x => x.actionId == REBasics.actions.ReadActionId);
            for (const reaction of reactions) {
                SEmittorPerformer.makeWithEmitor(actor, actor, REData.getEmittorById(reaction.emittingEffect))
                    .setItemEntity(self)
                    .setSelectedTargetItems(activity.objects2())
                    .perform(cctx);
                cctx.postDestroy(self);
            }
        }
        // [食べられた]
        else if (activity.actionId() == REBasics.actions.EatActionId) {
            const subject = activity.actor();
            const reactor = activity.object();
            if (reactor) {
                UIdentify.identifyByTiming(cctx, subject, reactor, DIdentifiedTiming.Eat);
                cctx.post(reactor, subject, new SEffectSubject(subject), undefined, onEatReaction);
            }
            
            return SCommandResponse.Handled;
        }

        return SCommandResponse.Pass;
    }

    [onEatReaction](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
        const self = args.self;
        this.applyEffect(cctx, self, args.sender, args.subject, DEffectCause.Eat, self.dir);

        // 食べられたので削除。
        // [かじる] も [食べる] の一部として考えるような場合は Entity が削除されることは無いので、
        // actor 側で destroy するのは望ましくない。
        self.destroy();

        return SCommandResponse.Handled;
    }

    [onCollideAction](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
        throw new Error("deprecated");
        const self = args.self;
        
        cctx.postDestroy(self);

        const a = args.args as CollideActionArgs;
        this.applyEffect(cctx, self, args.sender, args.subject, DEffectCause.Hit, a.dir);
        
        //

        //LProjectableBehavior.startMoveAsProjectile(cctx, args.sender, a.dir, 5);
        

        return SCommandResponse.Handled;
    }
    
    private applyEffect(cctx: SCommandContext, self: LEntity, target: LEntity, subject: SEffectSubject, cause: DEffectCause, effectDir: number, onPerformedFunc?: SOnPerformedFunc): void {
        const entityData = self.data();
        const emittors = entityData.emittorSet.emittors(cause);
        if (emittors.length > 0) {
            cctx.postCall(() => {
                for (const emittor of emittors) {
                    //SEmittorPerformer.makeWithEmitor(subject.entity(), emittor)
                    SEmittorPerformer.makeWithEmitor(subject.entity(), target, emittor)
                        .setItemEntity(self)
                        .setDffectDirection(effectDir)
                        .perform(cctx, onPerformedFunc);
                }
            });
        }
        
        // const skill = entityData.emittorSet.skill(cause);
        // if (skill) {
        //     cctx.postCall(() => {
        //         SEmittorPerformer.makeWithSkill(subject.entity(), skill.id)
        //             .setItemEntity(self)
        //             .setDffectDirection(effectDir)
        //             .performe(cctx);
        //     });
        // }
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

