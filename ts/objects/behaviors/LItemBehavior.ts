import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DEffectCause } from "ts/data/DEffect";
import { DItem, DItemDataId } from "ts/data/DItem";
import { REData } from "ts/data/REData";
import { REResponse } from "ts/system/RECommand";
import { RESystem } from "ts/system/RESystem";
import { SCommandContext } from "ts/system/SCommandContext";
import { SEffectContext, SEffectIncidentType, SEffectorFact, SEffectSubject } from "ts/system/SEffectContext";
import { SEffectPerformer } from "ts/system/SEffectPerformer";
import { LActivity } from "../activities/LActivity";
import { LWaveActivity } from "../activities/LWaveActivity";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, onCollideAction, onEatReaction } from "./LBehavior";


/**
 * Item として表現する Entity の共通 Behavior
 */
export class LItemBehavior extends LBehavior {
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LItemBehavior);
        return b
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

    onActivityReaction(self: LEntity, context: SCommandContext, activity: LActivity): REResponse {
        if (activity instanceof LWaveActivity) {
            console.log("aa LWaveActivity");
        }

        const effectPerformer = new SEffectPerformer();
        const reactions = self.data().reactions.filter(x => x.actionId == DBasics.actions.WaveActionId);
        for (const reaction of reactions) {
            const effect = REData.getEmittorById(reaction.emittingEffect);
            effectPerformer.performeEffect(context, activity.subject(), effect, this.itemData());

            /*
            const effectSubject = new SEffectorFact(subject.entity(), effect, itemData.rmmzScope, SEffectIncidentType.IndirectAttack);
            const effectContext = new SEffectContext(effectSubject);
    
            context.postAnimation(target, itemData.animationId, true);
    
            // アニメーションを Wait してから効果を発動したいので、ここでは post が必要。
            context.postCall(() => {
                effectContext.applyWithWorth(context, [target]);
            });
            */
        }

        return REResponse.Pass;
    }

    [onEatReaction](args: CommandArgs, context: SCommandContext): REResponse {
        const self = args.self;
        this.applyEffect(context, self, args.sender, args.subject, DEffectCause.Eat);

        // 食べられたので削除。
        // [かじる] も [食べる] の一部として考えるような場合は Entity が削除されることは無いので、
        // actor 側で destroy するのは望ましくない。
        self.destroy();

        return REResponse.Succeeded;
    }

    [onCollideAction](args: CommandArgs, context: SCommandContext): REResponse {
        const self = args.self;
        
        context.postDestroy(self);

        this.applyEffect(context, self, args.sender, args.subject, DEffectCause.Hit);
        
        //const a = args.args as CollideActionArgs;

        //LProjectableBehavior.startMoveAsProjectile(context, args.sender, a.dir, 5);
        

        return REResponse.Succeeded;
    }
    
    private applyEffect(context: SCommandContext, self: LEntity, target: LEntity, subject: SEffectSubject, cause: DEffectCause): void {

        const item = this.ownerEntity().getBehavior(LItemBehavior);
        const itemData = item.itemData();
        const effect = itemData.effectSet.effect(cause);
        if (effect) {

            console.log("applyEffect", effect);

            const effectSubject = new SEffectorFact(subject.entity(), effect, SEffectIncidentType.IndirectAttack);
            const effectContext = new SEffectContext(effectSubject);
    
            context.postAnimation(target, itemData.animationId, true);
    
            // アニメーションを Wait してから効果を発動したいので、ここでは post が必要。
            context.postCall(() => {
                effectContext.applyWithWorth(context, [target]);
            });
        }
        
        const skill = itemData.effectSet.skill(cause);
        if (skill) {
            console.log("postPerformSkill", skill);
            context.postPerformSkill(subject.entity(), skill.id);
        }
    }

}

