import { RE_Game_Entity } from "./REGame_Entity";
import { REGame_UnitAttribute } from "./REGame_Attribute";
import { REData } from "./REData";



export class REGame_EntityFactory {
    static newActor(): RE_Game_Entity {
        const e = RE_Game_Entity.newEntity();
        e.attrbutes = [
            new REGame_UnitAttribute()
                .setFactionId(REData.ActorDefaultFactionId),
        ]
        return e;
    }
}

