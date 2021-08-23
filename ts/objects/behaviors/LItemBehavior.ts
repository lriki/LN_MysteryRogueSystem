import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DEffectCause } from "ts/data/DEffect";
import { DIdentifiedTiming } from "ts/data/DIdentifyer";
import { DItem, DItemDataId } from "ts/data/DItem";
import { REData } from "ts/data/REData";
import { REResponse } from "ts/system/RECommand";
import { RESystem } from "ts/system/RESystem";
import { SCommandContext } from "ts/system/SCommandContext";
import { SEffectContext, SEffectIncidentType, SEffectorFact, SEffectSubject } from "ts/system/SEffectContext";
import { SEmittorPerformer } from "ts/system/SEmittorPerformer";
import { UIdentify } from "ts/usecases/UIdentify";
import { LActivity } from "../activities/LActivity";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { CollideActionArgs, CommandArgs, LBehavior, onCollideAction, onEatReaction } from "./LBehavior";


/**
 * Item として表現する Entity の共通 Behavior
 */
export class LItemBehavior extends LBehavior {
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

    onActivityReaction(self: LEntity, context: SCommandContext, activity: LActivity): REResponse {
        // [振られた]
        if (activity.actionId() == DBasics.actions.WaveActionId) {
            const subject = activity.subject();
            const reactions = self.data().reactions.filter(x => x.actionId == DBasics.actions.WaveActionId);
            for (const reaction of reactions) {
                SEmittorPerformer.makeWithEmitor(subject, REData.getEmittorById(reaction.emittingEffect))
                    .setItemEntity(self)
                    .performe(context);
            }
        }
        // [読まれた]
        else if (activity.actionId() == DBasics.actions.ReadActionId) {
            const subject = activity.subject();
            const reactions = self.data().reactions.filter(x => x.actionId == DBasics.actions.ReadActionId);
            for (const reaction of reactions) {
                SEmittorPerformer.makeWithEmitor(subject, REData.getEmittorById(reaction.emittingEffect))
                    .setItemEntity(self)
                    .setSelectedTargetItems(activity.objects2())
                    .performe(context);
            }
        }
        // [食べられた]
        else if (activity.actionId() == DBasics.actions.EatActionId) {
            console.log("EatActionId!!!!!!!!!!!");
            const reactor = activity.object();
            if (reactor) {
                UIdentify.identifyByTiming(context, self, reactor, DIdentifiedTiming.Eat);
                context.post(reactor, self, new SEffectSubject(self), undefined, onEatReaction);
            }
            
            return REResponse.Succeeded;
        }


        return REResponse.Pass;
    }

    [onEatReaction](args: CommandArgs, context: SCommandContext): REResponse {
        const self = args.self;
        this.applyEffect(context, self, args.sender, args.subject, DEffectCause.Eat, self.dir);

        // 食べられたので削除。
        // [かじる] も [食べる] の一部として考えるような場合は Entity が削除されることは無いので、
        // actor 側で destroy するのは望ましくない。
        self.destroy();

        return REResponse.Succeeded;
    }

    [onCollideAction](args: CommandArgs, context: SCommandContext): REResponse {
        const self = args.self;
        
        context.postDestroy(self);

        const a = args.args as CollideActionArgs;
        this.applyEffect(context, self, args.sender, args.subject, DEffectCause.Hit, a.dir);
        
        //

        //LProjectableBehavior.startMoveAsProjectile(context, args.sender, a.dir, 5);
        

        return REResponse.Succeeded;
    }
    
    private applyEffect(context: SCommandContext, self: LEntity, target: LEntity, subject: SEffectSubject, cause: DEffectCause, effectDir: number): void {
        const item = this.ownerEntity().getBehavior(LItemBehavior);
        const emittor = self.data().effectSet.effect(cause);
        
        if (emittor) {
            context.postCall(() => {
                SEmittorPerformer.makeWithEmitor(target, emittor)
                    .setItemEntity(self)
                    .setDffectDirection(effectDir)
                    .performe(context);
            });
        }
        
        const skill = self.data().effectSet.skill(cause);
        if (skill) {
            context.postCall(() => {
                SEmittorPerformer.makeWithSkill(subject.entity(), skill.id)
                    .setItemEntity(self)
                    .setDffectDirection(effectDir)
                    .performe(context);
            });
        }
    }

}

