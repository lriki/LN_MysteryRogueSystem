import { assert } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { DEffectBehaviorId } from "ts/re/data/DCommon";
import { SEffectBehavior } from "./SEffectBehavior";
import { SGoldStealEffectBehavior } from "./SGoldStealEffectBehavior";
import { SItemStealSkillBehavior } from "./SItemStealEffectBehavior";
import { SLevelDownEffectBehavior } from "./SLevelDownEffectBehavior";
import { SWarpEffectBehavior } from "./SWrapEffectBehavior";

export class SEffectBehaviorManager {
    private behaviors: (SEffectBehavior | undefined)[] = [];    // Index is DSkillBehaviorId

    public constructor() {
        this.setupBuiltins();
    }

    public register(effectBehaviorId: DEffectBehaviorId, behavior: SEffectBehavior) {
        this.behaviors[effectBehaviorId] = behavior;
    }

    public find(effectBehaviorId: DEffectBehaviorId): SEffectBehavior | undefined {
        return this.behaviors[effectBehaviorId];
    }

    public get(effectBehaviorId: DEffectBehaviorId): SEffectBehavior {
        const b = this.find(effectBehaviorId);
        assert(b);
        return b;
    }

    private setupBuiltins(): void {
        this.register(REBasics.effectBehaviors.itemSteal, new SItemStealSkillBehavior());
        this.register(REBasics.effectBehaviors.goldSteal, new SGoldStealEffectBehavior());
        this.register(REBasics.effectBehaviors.levelDown, new SLevelDownEffectBehavior());
        this.register(REBasics.effectBehaviors.warp, new SWarpEffectBehavior());

        
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
