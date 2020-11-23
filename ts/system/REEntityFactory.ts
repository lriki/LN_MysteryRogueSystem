import { REGame_Entity } from "../RE/REGame_Entity";
import { LUnitAttribute } from "../objects/attributes/LAttribute";
import { REData } from "../data/REData";
import { REGame } from "../RE/REGame";
import { REGame_DecisionBehavior } from "../objects/behaviors/REDecisionBehavior";
import { REUnitBehavior } from "../objects/behaviors/REUnitBehavior";
import { RETileAttribute } from "../objects/attributes/RETileAttribute";
import { TileKind } from "../RE/REGame_Block";
import { REExitPointBehavior } from "ts/objects/behaviors/REExitPointBehavior";
import { DStateId } from "ts/data/DState";
import { LBattlerBehavior } from "ts/objects/behaviors/LBattlerBehavior";

export class REEntityFactory {
    static newTile(kind: TileKind): REGame_Entity {
        const entity = REGame.world.spawnEntity();
        entity.addAttribute(new RETileAttribute().setTileKind(kind));
        return entity;
    }

    static newActor(): REGame_Entity {
        const e = REGame.world.spawnEntity();
        e.addAttribute(new LUnitAttribute()
            .setFactionId(REData.ActorDefaultFactionId));
        e.addBasicBehavior(new REGame_DecisionBehavior());
        e.addBasicBehavior(new REUnitBehavior());
        e.addBasicBehavior(new LBattlerBehavior());
        return e;
    }

    static newMonster(monsterId: number): REGame_Entity {
        const e = REGame.world.spawnEntity();
        e.addAttribute(new LUnitAttribute()
            .setFactionId(REData.ActorDefaultFactionId));
        e.addBasicBehavior(new REGame_DecisionBehavior());
        e.addBasicBehavior(new REUnitBehavior());
        e.addBasicBehavior(new LBattlerBehavior());
        return e;
    }

    static newExitPoint(): REGame_Entity {
        const e = REGame.world.spawnEntity();
        e.addBasicBehavior(new REExitPointBehavior());
        return e;
    }

    /*
    static newEntityFromName(name: string): REGame_Entity {
        switch (name) {
            case "ExitPoint":
                return this.newExitPoint();
            default:
                throw new Error("Invalid entity name: " + name);
        }
    }
    */
}

