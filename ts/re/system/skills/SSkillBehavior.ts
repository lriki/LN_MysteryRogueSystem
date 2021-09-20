import { assert } from "ts/re/Common";
import { DEffectBehaviorId, DSkillId } from "ts/re/data/DCommon";
import { LEntity } from "ts/re/objects/LEntity";
import { SCommandContext } from "../SCommandContext";


export abstract class SSkillBehavior {

    /**
     * self が発動したスキルの処理が終わった (成否は target の result を確認すること)
     * Skill の効果として、特定 Behavior の状態を変えたりするのに使う。
     */
     onSkillPerformed(cctx: SCommandContext, self: LEntity, targets: LEntity[], skillId: DSkillId): void {}
     
/*
    public onSelfEffectApplied(cctx: SCommandContext, modifier: SEffectModifier, entity: LEntity) {

    }

    public onTargetEffectApplied(cctx: SCommandContext, modifier: SEffectModifier, entity: LEntity) {

    }
    */
}



export class SSkillBehaviorManager {
    private static behaviors: (SSkillBehavior | undefined)[] = [];    // Index is DSkillBehaviorId

    public static register(skillBehaviorId: DEffectBehaviorId, behavior: SSkillBehavior) {
        this.behaviors[skillBehaviorId] = behavior;
    }

    public static find(skillBehaviorId: DEffectBehaviorId): SSkillBehavior | undefined {
        return this.behaviors[skillBehaviorId];
    }

    public static get(skillBehaviorId: DEffectBehaviorId): SSkillBehavior {
        const b = this.find(skillBehaviorId);
        assert(b);
        return b;
    }
}

/*
export abstract class LSkillBehavior {
    abstract onPerforme(skillId: DSkillDataId, entity: LEntity, context: SCommandContext): void;
}

export class LNormalAttackSkillBehavior extends LSkillBehavior {
    onPerforme(skillId: DSkillDataId, entity: LEntity, context: SCommandContext): void {

        const skill = REData.skills[skillId];
        const subject = entity.getBehavior(LBattlerBehavior);
        ///const effector = new SEffectorFact(entity, skill.effect);
        

        // もともと UntBehavior.onAction() で AttackActionId をフックして処理していたが、こちらに持ってきた。
        // Attack という Action よりは、「スキル発動」という Action を実行する方が自然かも。

        const effect = skill.effect;//Set.effect(DEffectCause.Affect);
        if (effect) {
            context.postSequel(entity, RESystem.sequels.attack);

            // TODO: 正面3方向攻撃とかの場合はここをループする
            //for ()
            {
                // 攻撃対象決定
                const front = Helpers.makeEntityFrontPosition(entity, 1);
                const block = REGame.map.block(front.x, front.y);
                const target = context.findReactorEntityInBlock(block, DBasics.actions.AttackActionId);
                if (target) {
                    const effectSubject = new SEffectorFact(entity, effect ,skill.rmmzEffectScope, SEffectIncidentType.DirectAttack);
                    const effectContext = new SEffectContext(effectSubject);
                    //effectContext.addEffector(effector);


                    if (SMovementCommon.checkDiagonalWallCornerCrossing(entity, entity.dir)) {
                        // 斜め向きで壁の角と交差しているので通常攻撃は通らない
                    }
                    else {
                        const rmmzAnimationId = (skill.rmmzAnimationId < 0) ? subject.attackAnimationId() : skill.rmmzAnimationId;
                        if (rmmzAnimationId > 0) {
                            context.postAnimation(target, rmmzAnimationId, true);
                        }
                        
                        // TODO: SEffectSubject はダミー
                        context.post(target, entity, new SEffectSubject(entity), {effectContext: effectContext}, onAttackReaction);
    
                        //context.postReaction(DBasics.actions.AttackActionId, reacor, entity, effectContext);
                    }
                    
                }
            }

        }
    }
}

*/
