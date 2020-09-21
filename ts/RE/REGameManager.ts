import { REGame } from "./REGame";
import { RE_Data } from "./RE_DataManager";
import { RE_Game_Entity } from "./REGame_Entity";
import { RE_Game_EntityFactory } from "./REGame_EntityFactory";
import { REGame_Map } from "./REGame_Map";
import { RE_Game_World } from "./REGame_World";


/**
 */
export class REGameManager
{
    static createGameObjects(): void {
        REGame.world = new RE_Game_World();
        REGame.map = new REGame_Map();


        // Create unique units
        RE_Data.actors.forEach(x => {
            const unit = RE_Game_EntityFactory.newActor();
            REGame.actorUnits.push(unit);
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

