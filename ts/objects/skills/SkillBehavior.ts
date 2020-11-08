import { REGame_Entity } from "ts/RE/REGame_Entity";
import { RECommandContext } from "ts/system/RECommandContext";

export abstract class VSkillBehavior {
    abstract onPerforme(entity: REGame_Entity, context: RECommandContext): void;
}

export class VNormalAttackSkillBehavior extends VSkillBehavior {
    onPerforme(entity: REGame_Entity, context: RECommandContext): void {
        console.log("VNormalAttackSkillBehavior");
    }
}

