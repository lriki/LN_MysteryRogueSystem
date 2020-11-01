import { REGame_Entity } from "../RE/REGame_Entity";
import { REGame_UnitAttribute } from "../RE/REGame_Attribute";
import { REData } from "../data/REData";
import { REGame } from "../RE/REGame";
import { REGame_DecisionBehavior } from "../behaviors/REDecisionBehavior";
import { REUnitBehavior } from "../behaviors/REUnitBehavior";
import { RETileAttribute } from "../attributes/RETileAttribute";
import { TileKind } from "../RE/REGame_Block";
import { REExitPointBehavior } from "ts/behaviors/REExitPointBehavior";

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

    static newExitPoint(): REGame_Entity {
        const e = REGame.world.spawnEntity();
        e.addBehavior(new REExitPointBehavior());
        return e;
    }

    static newEntityFromName(name: string): REGame_Entity {
        switch (name) {
            case "ExitPoint":
                return this.newExitPoint();
            default:
                throw new Error("Invalid entity name: " + name);
        }
    }
}

