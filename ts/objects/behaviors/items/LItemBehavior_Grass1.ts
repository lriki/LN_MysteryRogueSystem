import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { LEntity } from "ts/objects/LEntity";
import { REResponse } from "ts/system/RECommand";
import { SEffectContext, SEffectIncidentType, SEffectorFact, SEffectSubject } from "ts/system/SEffectContext";
import { SCommandContext } from "ts/system/SCommandContext";
import { CommandArgs, LBehavior, onCollideAction, onEatReaction } from "../LBehavior";
import { LItemBehavior } from "../LItemBehavior";
import { DEffectCause } from "ts/data/DEffect";
import { REGame } from "ts/objects/REGame";

/**
 * 
 */
export class LItemBehavior_Grass1 extends LBehavior {
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LItemBehavior_Grass1);
        return b;
    }

    onQueryReactions(actions: DActionId[]): void {
        actions.push(DBasics.actions.EatActionId);
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


            const effectSubject = new SEffectorFact(subject.entity(), effect, itemData.rmmzScope, SEffectIncidentType.IndirectAttack);
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

