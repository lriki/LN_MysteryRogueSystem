import { REGame_Entity } from "../RE/REGame_Entity";
import { REGame_UnitAttribute } from "../RE/REGame_Attribute";
import { REData } from "../data/REData";
import { REGame } from "../RE/REGame";
import { REGame_DecisionBehavior } from "../behaviors/REDecisionBehavior";
import { REUnitBehavior } from "../behaviors/REUnitBehavior";
import { RETileAttribute } from "../attributes/RETileAttribute";
import { TileKind } from "../RE/REGame_Block";

export class REEntityFactory {
    static newTile(kind: TileKind): REGame_Entity {
        const entity = REGame.world.spawnEntity();
        entity.addAttribute(new RETileAttribute().setTileKind(kind));
        return entity;
    }

    static newActor(): REGame_Entity {
        const e = REGame.world.spawnEntity();
        e.attrbutes = [
            new REGame_UnitAttribute()
                .setFactionId(REData.ActorDefaultFactionId),
        ]
        e.addBehavior(new REGame_DecisionBehavior());
        e.addBehavior(new REUnitBehavior());
        return e;
    }
}

