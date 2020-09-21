import { REGame } from "./REGame";
import { RE_Game_Entity } from "./REGame_Entity";
import { REGame_EntityFactory } from "./REGame_EntityFactory";
import { REGame_Map } from "./REGame_Map";
import { RE_Game_World } from "./REGame_World";
import { REGame_Core } from "./REGame_Core";
import { RE_Data } from "./RE_Data";


/**
 */
export class REGameManager
{
    static createGameObjects(): void {
        REGame.core = new REGame_Core();
        REGame.world = new RE_Game_World();
        REGame.map = new REGame_Map();
        REGame.actorUnits = [];

        // Create unique units
        RE_Data.actors.forEach(x => {
            const unit = REGame_EntityFactory.newActor();
            REGame.actorUnits.push(unit);
            
            //const attr = unit.findAttribute(REGame_PositionalAttribute);
            //if (attr) {
            //}
        });

/*
        let a = RE_Game_EntityFactory.newActor();
        let b = a.findAttribute(RE_Game_UnitAttribute);
        let c = a.findAttribute(RE_Game_PositionalAttribute);
        console.log("b: ", b);
        console.log("c: ", c);
        */
    }
}

