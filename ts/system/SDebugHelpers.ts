import { LEntity } from "ts/objects/LEntity";
import { LBattlerBehavior } from "ts/objects/behaviors/LBattlerBehavior";
import { RESystem } from "./RESystem";

export class SDebugHelpers {
    public static setHP(entity: LEntity, value: number): void {
        const battler = entity.findBehavior(LBattlerBehavior);
        if (battler) {
            const mhp = battler.idealParam(RESystem.parameters.hp);
            battler.setActualDamgeParam(RESystem.parameters.hp, mhp - value);
            //const hp = battler.actualParam(RESystem.parameters.hp);
            //console.log(hp);
        }
    }
}
