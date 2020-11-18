import { SkillDataId } from "ts/data/DSkill";
import { REData } from "ts/data/REData";
import { REGame } from "ts/RE/REGame";
import { REGame_Entity } from "ts/RE/REGame_Entity";
import { Helpers } from "ts/system/Helpers";
import { RECommandContext } from "ts/system/RECommandContext";
import { REEffectContext, SEffectorFact } from "ts/system/REEffectContext";

export abstract class LSkillBehavior {
    abstract onPerforme(skillId: SkillDataId, entity: REGame_Entity, context: RECommandContext): void;
}

export class LNormalAttackSkillBehavior extends LSkillBehavior {
    onPerforme(skillId: SkillDataId, entity: REGame_Entity, context: RECommandContext): void {
        console.log("LNormalAttackSkillBehavior");

        const skill = REData.skills[skillId];
        const effector = new SEffectorFact(entity, skill.effect);
        const effectContext = new REEffectContext();
        effectContext.addEffector(effector);
        

        console.log("effector:", effector);
        
        context.postActionOneWay(REData.AttackActionId, entity, effectContext);
    }
}

