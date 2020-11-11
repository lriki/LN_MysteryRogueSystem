import { REData } from "ts/data/REData";
import { REGame_Behavior } from "ts/RE/REGame_Behavior";
import { REGame_Entity } from "ts/RE/REGame_Entity";
import { SEffectorFact } from "ts/system/REEffectContext";
import { LBattlerAttribute } from "../attributes/LBattlerAttribute";

export class LBattlerBehavior extends REGame_Behavior {
    
    onCollectEffector(owner: REGame_Entity, data: SEffectorFact): void {
        const attr = owner.findAttribute(LBattlerAttribute);
        if (attr) {
            for (let i = 0; i < REData.parameters.length; i++) {
                data.setActualParam(i, attr.actualParam(i));
            }
        }
    }
    
}

