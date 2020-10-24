import { REGame } from "./REGame";
import { REGame_Entity } from "./REGame_Entity";
import { REGame_EntityFactory } from "./REGame_EntityFactory";
import { REGame_Map } from "./REGame_Map";
import { RE_Game_World } from "./REGame_World";
import { REGame_Core } from "./REGame_Core";
import { REData } from "./REData";
import { REScheduler } from "./REScheduler";
import { REGame_UnitAttribute } from "./REGame_Attribute";


/**
 */
export class REGameManager
{
    static createGameObjects(): void {
        REGame.scheduler = new REScheduler();
        REGame.core = new REGame_Core();
        REGame.world = new RE_Game_World();
        REGame.map = new REGame_Map();
        REGame.actorUnits = [];

        // Create unique units
        REData.actors.forEach(x => {
            const unit = REGame_EntityFactory.newActor();
            REGame.actorUnits.push(unit);
            
            //const attr = unit.findAttribute(REGame_PositionalAttribute);
            //if (attr) {
            //}
        });

        // 1 番 Actor をデフォルトで操作可能とする
        const firstActor = REGame.actorUnits[0];
        const unit = firstActor.findAttribute(REGame_UnitAttribute);
        if (unit) {
            unit.setManualMovement(true);
        }

/*
        let a = RE_Game_EntityFactory.newActor();
        let b = a.findAttribute(RE_Game_UnitAttribute);
        let c = a.findAttribute(RE_Game_PositionalAttribute);
        console.log("b: ", b);
        console.log("c: ", c);
        */
    }

    static visualRunning(): boolean {
        return false;
    }

    static update(): void {
        //REGame.scheduler.stepSimulation();
    }
}

