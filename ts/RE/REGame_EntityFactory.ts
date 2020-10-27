import { REGame_Entity } from "./REGame_Entity";
import { REGame_UnitAttribute } from "./REGame_Attribute";
import { REData } from "../data/REData";
import { REGame } from "./REGame";
import { REGame_DecisionBehavior } from "../behaviors/REDecisionBehavior";



export class REGame_EntityFactory {
    static newActor(): REGame_Entity {
        const e = REGame.world.spawnEntity(1, 0, 0); //REGame_Entity.newEntity();
        e.attrbutes = [
            new REGame_UnitAttribute()
                .setFactionId(REData.ActorDefaultFactionId),
        ]
        e.addBehavior(new REGame_DecisionBehavior());
        return e;
    }
}

