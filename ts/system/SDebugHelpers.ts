import { LEntity } from "ts/objects/LEntity";
import { LBattlerBehavior } from "ts/objects/behaviors/LBattlerBehavior";
import { RESystem } from "./RESystem";
import { DBasics } from "ts/data/DBasics";

export class SDebugHelpers {
    public static setHP(entity: LEntity, value: number): void {
        const battler = entity.findBehavior(LBattlerBehavior);
        if (battler) {
            const mhp = battler.idealParam(DBasics.params.hp);
            battler.setActualDamgeParam(DBasics.params.hp, mhp - value);
            //const hp = battler.actualParam(DBasics.params.hp);
            //console.log(hp);
        }
    }
}
