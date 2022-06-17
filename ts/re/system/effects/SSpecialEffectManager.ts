import { assert } from "ts/re/Common";
import { MRBasics } from "ts/re/data/MRBasics";
import { DSpecificEffectId } from "ts/re/data/DCommon";
import { SSpecialEffect } from "./SSpecialEffect";
import { SGoldStealSpecialEffect } from "./SGoldStealSpecialEffect";
import { SItemStealSpecialEffect } from "./SItemStealSpecialEffect";
import { SLevelDownSpecialEffect } from "./SLevelDownSpecialEffect";
import { SWarpSpecialEffect } from "./SWrapSpecialEffect";
import { SStumbleSpecialEffect } from "./SStumbleSpecialEffect";
import { STransferToNextFloorSpecialEffect } from "./STransferToNextFloorSpecialEffect";
import { STransferToLowerFloorSpecialEffect } from "./STransferToLowerFloorSpecialEffect";
import { STrapProliferationSpecialEffect } from "./STrapProliferationSpecialEffect";
import { SDispelEquipmentsSpecialEffect } from "./SDispelEquipmentsSpecialEffect";
import { SChangeInstanceSpecialEffect } from "./SChangeInstanceSpecialEffect";
import { SRestartFloorSpecialEffect } from "./SRestartFloorSpecialEffect";
import { SClarificationSpecialEffect } from "./SClarificationSpecialEffect";
import { SDivisionSpecialEffect } from "./SDivisionSpecialEffect";
import { SRemoveStatesByIntentionsSpecialEffect } from "./SRemoveStatesByIntentionsSpecialEffect";
import { SPerformeSkillSpecialEffect } from "./SPerformeSkillSpecialEffect";

export class SSpecialEffectManager {
    private behaviors: (SSpecialEffect | undefined)[] = [];    // Index is DSkillBehaviorId

    public constructor() {
        this.setupBuiltins();
    }

    public register(specialEffectId: DSpecificEffectId, behavior: SSpecialEffect) {
        this.behaviors[specialEffectId] = behavior;
    }

    public find(specialEffectId: DSpecificEffectId): SSpecialEffect | undefined {
        return this.behaviors[specialEffectId];
    }

    public get(specialEffectId: DSpecificEffectId): SSpecialEffect {
        const b = this.find(specialEffectId);
        assert(b);
        return b;
    }

    private setupBuiltins(): void {
        this.register(MRBasics.effectBehaviors.itemSteal, new SItemStealSpecialEffect());
        this.register(MRBasics.effectBehaviors.goldSteal, new SGoldStealSpecialEffect());
        this.register(MRBasics.effectBehaviors.levelDown, new SLevelDownSpecialEffect());
        this.register(MRBasics.effectBehaviors.warp, new SWarpSpecialEffect());
        this.register(MRBasics.effectBehaviors.stumble, new SStumbleSpecialEffect());
        this.register(MRBasics.effectBehaviors.transferToNextFloor, new STransferToNextFloorSpecialEffect());
        this.register(MRBasics.effectBehaviors.transferToLowerFloor, new STransferToLowerFloorSpecialEffect());
        this.register(MRBasics.effectBehaviors.trapProliferation, new STrapProliferationSpecialEffect());
        this.register(MRBasics.effectBehaviors.dispelEquipments, new SDispelEquipmentsSpecialEffect());
        this.register(MRBasics.effectBehaviors.changeInstance, new SChangeInstanceSpecialEffect());
        this.register(MRBasics.effectBehaviors.restartFloor, new SRestartFloorSpecialEffect());
        this.register(MRBasics.effectBehaviors.clarification, new SClarificationSpecialEffect());
        this.register(MRBasics.effectBehaviors.division, new SDivisionSpecialEffect());
        this.register(MRBasics.effectBehaviors.removeStatesByIntentions, new SRemoveStatesByIntentionsSpecialEffect());
        this.register(MRBasics.effectBehaviors.performeSkill, new SPerformeSkillSpecialEffect());
    }
}

/*
export abstract class LSkillBehavior {
    abstract onPerforme(skillId: DSkillDataId, entity: LEntity, cctx: SCommandContext): void;
}

export class LNormalAttackSkillBehavior extends LSkillBehavior {
    onPerforme(skillId: DSkillDataId, entity: LEntity, cctx: SCommandContext): void {

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
