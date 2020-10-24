import { REGame_Entity } from "./REGame_Entity";
import { REGame_UnitAttribute } from "./REGame_Attribute";
import { REData } from "./REData";



export class REGame_EntityFactory {
    static newActor(): REGame_Entity {
        const e = REGame_Entity.newEntity();
        e.attrbutes = [
            new REGame_UnitAttribute()
                .setFactionId(REData.ActorDefaultFactionId),
        ]
        return e;
    }
}

