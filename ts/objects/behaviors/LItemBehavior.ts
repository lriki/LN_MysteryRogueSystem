import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DEffectCause } from "ts/data/DEffect";
import { DItem, DItemDataId } from "ts/data/DItem";
import { REData } from "ts/data/REData";
import { REResponse } from "ts/system/RECommand";
import { RESystem } from "ts/system/RESystem";
import { SCommandContext } from "ts/system/SCommandContext";
import { SEffectContext, SEffectIncidentType, SEffectorFact, SEffectSubject } from "ts/system/SEffectContext";
import { SEmittorPerformer } from "ts/system/SEmittorPerformer";
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
        if (activity.actionId() == DBasics.actions.WaveActionId) {
            const subject = activity.subject();
            const effectPerformer = new SEmittorPerformer();
            const reactions = self.data().reactions.filter(x => x.actionId == DBasics.actions.WaveActionId);
            for (const reaction of reactions) {
                const emittor = REData.getEmittorById(reaction.emittingEffect);
                effectPerformer.performeEffect(context, subject, emittor, subject.dir, self, []);
            }
        }
        else if (activity.actionId() == DBasics.actions.ReadActionId) {
            const subject = activity.subject();
            const effectPerformer = new SEmittorPerformer();
            const reactions = self.data().reactions.filter(x => x.actionId == DBasics.actions.ReadActionId);
            for (const reaction of reactions) {
                const emittor = REData.getEmittorById(reaction.emittingEffect);
                effectPerformer.performeEffect(context, subject, emittor, subject.dir, self, activity.objects2());
            }
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
        const itemData = item.itemData();
        const emittor = self.data().effectSet.effect(cause);
        
        if (emittor) {
            context.postPerformEmittor(target, emittor, effectDir, self, []);

            /*
            console.log("applyEffect", emittor);

            const effectSubject = new SEffectorFact(subject.entity(), emittor.effect, SEffectIncidentType.IndirectAttack);
            const effectContext = new SEffectContext(effectSubject);
    
            context.postAnimation(target, itemData.animationId, true);
    
            // アニメーションを Wait してから効果を発動したいので、ここでは post が必要。
            context.postCall(() => {
                effectContext.applyWithWorth(context, [target]);
            });
            */
        }
        
        const skill = self.data().effectSet.skill(cause);
        if (skill) {
            context.postPerformSkill(subject.entity(), skill.id, self);
        }
    }

}

