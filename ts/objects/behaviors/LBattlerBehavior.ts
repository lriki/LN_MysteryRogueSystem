import { assert } from "ts/Common";
import { REData } from "ts/data/REData";
import { REGame_Behavior } from "ts/RE/REGame_Behavior";
import { REGame_Entity } from "ts/RE/REGame_Entity";
import { REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { SEffectorFact } from "ts/system/REEffectContext";
import { RESystem } from "ts/system/RESystem";
import { LBattlerAttribute } from "../attributes/LBattlerAttribute";

export class LBattlerBehavior extends REGame_Behavior {
    
    onCollectEffector(owner: REGame_Entity, data: SEffectorFact): void {
        const attr = owner.findAttribute(LBattlerAttribute);
        assert(attr);   // 無いのは何かおかしい

        for (let i = 0; i < REData.parameters.length; i++) {
            data.setActualParam(i, attr.actualParam(i));
        }
    }
    
    
    onTurnEnd(context: RECommandContext): REResponse {
        console.log("onTurnEnd");

        const entity = this.entity();
        const attr = entity.findAttribute(LBattlerAttribute);
        if (attr) {
            if (attr.isDeathStateAffected()) {
                
                context.postSequel(entity, RESystem.sequels.CollapseSequel);

                context.postDestroy(entity);
            }
        }
        
        return REResponse.Pass;
    }
}

