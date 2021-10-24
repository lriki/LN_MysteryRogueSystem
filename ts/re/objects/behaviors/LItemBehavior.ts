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

    public itemDataId(): DItemDataId {
        const entity = this.ownerEntity().data();
        assert(entity.itemData);
        return entity.itemData.id;
    }

    public itemData(): DItem {
        const entity = this.ownerEntity().data();
        assert(entity.itemData);
        return entity.itemData;
    }

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

    onQueryProperty(propertyId: number): any {
        if (propertyId == RESystem.properties.itemId)
            return this.itemDataId();
        else
            super.onQueryProperty(propertyId);
    }

    onCollectTraits(result: IDataTrait[]): void {
        super.onCollectTraits(result);
        
        for (const trait of this.itemData().traits){
            result.push(trait);
        }
    }

    onActivity(self: LEntity, context: SCommandContext, activity: LActivity): SCommandResponse {
        if (activity.actionId() == REBasics.actions.collide) {
    
            
            const target = activity.objects2()[0];
            const subject = new SEffectSubject(activity.subject());
            context.postHandleActivity(activity, target)
            .then(() => {
                this.applyEffect(context, self, target, subject, DEffectCause.Hit, activity.effectDirection(), (targets: LEntity[]) => {
                    if (targets.find(x => !x._effectResult.missed)) {
                        context.postDestroy(self);
                        console.log("Hit");
                    }
                    else {
                        UAction.postDropOrDestroy(context, self, self.x, self.y);
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

    onActivityReaction(self: LEntity, context: SCommandContext, activity: LActivity): SCommandResponse {
        // [振られた]
        if (activity.actionId() == REBasics.actions.WaveActionId) {
            const actor = activity.actor();
            const reactions = self.data().reactions.filter(x => x.actionId == REBasics.actions.WaveActionId);
            for (const reaction of reactions) {
                SEmittorPerformer.makeWithEmitor(actor, actor, REData.getEmittorById(reaction.emittingEffect))
                    .setItemEntity(self)
                    .performe(context);
            }
        }
        // [読まれた]
        else if (activity.actionId() == REBasics.actions.ReadActionId) {
            const actor = activity.actor();
            const reactions = self.data().reactions.filter(x => x.actionId == REBasics.actions.ReadActionId);
            for (const reaction of reactions) {
                SEmittorPerformer.makeWithEmitor(actor, actor, REData.getEmittorById(reaction.emittingEffect))
                    .setItemEntity(self)
                    .setSelectedTargetItems(activity.objects2())
                    .performe(context);
                context.postDestroy(self);
            }
        }
        // [食べられた]
        else if (activity.actionId() == REBasics.actions.EatActionId) {
            const subject = activity.actor();
            const reactor = activity.object();
            if (reactor) {
                UIdentify.identifyByTiming(context, subject, reactor, DIdentifiedTiming.Eat);
                context.post(reactor, subject, new SEffectSubject(subject), undefined, onEatReaction);
            }
            
            return SCommandResponse.Handled;
        }

        return SCommandResponse.Pass;
    }

    [onEatReaction](args: CommandArgs, context: SCommandContext): SCommandResponse {
        const self = args.self;
        this.applyEffect(context, self, args.sender, args.subject, DEffectCause.Eat, self.dir);

        // 食べられたので削除。
        // [かじる] も [食べる] の一部として考えるような場合は Entity が削除されることは無いので、
        // actor 側で destroy するのは望ましくない。
        self.destroy();

        return SCommandResponse.Handled;
    }

    [onCollideAction](args: CommandArgs, context: SCommandContext): SCommandResponse {
        throw new Error("deprecated");
        const self = args.self;
        
        context.postDestroy(self);

        const a = args.args as CollideActionArgs;
        this.applyEffect(context, self, args.sender, args.subject, DEffectCause.Hit, a.dir);
        
        //

        //LProjectableBehavior.startMoveAsProjectile(context, args.sender, a.dir, 5);
        

        return SCommandResponse.Handled;
    }
    
    private applyEffect(context: SCommandContext, self: LEntity, target: LEntity, subject: SEffectSubject, cause: DEffectCause, effectDir: number, onPerformedFunc?: SOnPerformedFunc): void {
        const entityData = self.data();
        const emittors = entityData.emittorSet.emittors(cause);
        if (emittors.length > 0) {
            context.postCall(() => {
                for (const emittor of emittors) {
                    //SEmittorPerformer.makeWithEmitor(subject.entity(), emittor)
                    SEmittorPerformer.makeWithEmitor(subject.entity(), target, emittor)
                        .setItemEntity(self)
                        .setDffectDirection(effectDir)
                        .performe(context, onPerformedFunc);
                }
            });
        }
        
        // const skill = entityData.emittorSet.skill(cause);
        // if (skill) {
        //     context.postCall(() => {
        //         SEmittorPerformer.makeWithSkill(subject.entity(), skill.id)
        //             .setItemEntity(self)
        //             .setDffectDirection(effectDir)
        //             .performe(context);
        //     });
        // }
    }

    
    // TODO: すごく仮。今はアイテムが盗みスキルの効果を受け取るためだけにある
    [onAttackReaction](args: CommandArgs, context: SCommandContext): SCommandResponse {
        const self = args.self;
        const effectContext: SEffectContext = args.args.effectContext;
        if (effectContext) {
            const targets = [self];
            effectContext.applyWithWorth(context, targets);

            return SCommandResponse.Handled;
        }
        
        return SCommandResponse.Pass;
    }

}

