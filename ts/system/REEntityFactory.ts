import { REGame_Entity } from "../RE/REGame_Entity";
import { REGame_UnitAttribute } from "../RE/REGame_Attribute";
import { REData } from "../data/REData";
import { REGame } from "../RE/REGame";
import { REGame_DecisionBehavior } from "../objects/behaviors/REDecisionBehavior";
import { REUnitBehavior } from "../objects/behaviors/REUnitBehavior";
import { RETileAttribute } from "../objects/attributes/RETileAttribute";
import { TileKind } from "../RE/REGame_Block";
import { REExitPointBehavior } from "ts/objects/behaviors/REExitPointBehavior";
import { DStateId } from "ts/data/DState";
import { LGenericState } from "ts/objects/states/LGenericState";

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
        e.addBasicBehavior(new REGame_DecisionBehavior());
        e.addBasicBehavior(new REUnitBehavior());
        return e;
    }

    static newMonster(monsterId: number): REGame_Entity {
        const e = REGame.world.spawnEntity();
        e.attrbutes = [
            new REGame_UnitAttribute()
                .setFactionId(REData.EnemeyDefaultFactionId),
        ]
        e.addBasicBehavior(new REGame_DecisionBehavior());
        e.addBasicBehavior(new REUnitBehavior());
        return e;
    }

    static newExitPoint(): REGame_Entity {
        const e = REGame.world.spawnEntity();
        e.addBasicBehavior(new REExitPointBehavior());
        return e;
    }

    static newState(stateId: DStateId): REGame_Entity {
        const e = REGame.world.spawnEntity();
        const b = new LGenericState();
        b._dataId = stateId;
        e.addBasicBehavior(b);
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

