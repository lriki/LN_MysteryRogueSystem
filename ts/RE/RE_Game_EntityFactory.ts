import { RE_Game_Entity } from "./RE_Game_Entity";
import { RE_Game_UnitAttribute } from "./RE_Game_Attribute";



export class RE_Game_EntityFactory {
    static newActor(): RE_Game_Entity {
        const e = RE_Game_Entity.newEntity();
        e.attrbutes = [
            new RE_Game_UnitAttribute(),
        ]
        return e;
    }
}

