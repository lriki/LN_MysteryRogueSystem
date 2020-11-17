import { REData } from "ts/data/REData";
import { REGame } from "ts/RE/REGame";
import { REGame_Entity } from "ts/RE/REGame_Entity";
import { Helpers } from "ts/system/Helpers";
import { RECommandContext } from "ts/system/RECommandContext";

export abstract class VSkillBehavior {
    abstract onPerforme(entity: REGame_Entity, context: RECommandContext): void;
}

export class VNormalAttackSkillBehavior extends VSkillBehavior {
    onPerforme(entity: REGame_Entity, context: RECommandContext): void {
        console.log("VNormalAttackSkillBehavior");
        
        context.postActionOneWay(REData.AttackActionId, entity);
    }
}

