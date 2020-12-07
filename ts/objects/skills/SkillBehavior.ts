import { DBasics } from "ts/data/DBasics";
import { DSkillDataId } from "ts/data/DSkill";
import { REData } from "ts/data/REData";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { RECommandContext } from "ts/system/RECommandContext";
import { REEffectContext, SEffectorFact } from "ts/system/REEffectContext";

export abstract class LSkillBehavior {
    abstract onPerforme(skillId: DSkillDataId, entity: REGame_Entity, context: RECommandContext): void;
}

export class LNormalAttackSkillBehavior extends LSkillBehavior {
    onPerforme(skillId: DSkillDataId, entity: REGame_Entity, context: RECommandContext): void {

        const skill = REData.skills[skillId];
        const effector = new SEffectorFact(entity, skill.effect);
        const effectContext = new REEffectContext();
        effectContext.addEffector(effector);
        
        
        context.postActionOneWay(DBasics.actions.AttackActionId, entity, effectContext);
    }
}

