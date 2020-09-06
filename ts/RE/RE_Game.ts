import { RE_Game_Map } from "./RE_Game_Map";
import { RE_Game_EntityFactory } from "./RE_Game_EntityFactory";
import { RE_Game_UnitAttribute, RE_Game_PositionalAttribute } from "./RE_Game_Attribute";
import { RE_DataManager, RE_Data } from "./RE_DataManager";
import { RE_Game_Entity } from "./RE_Game_Entity";
import { RE_Game_World } from "./RE_Game_World";

export class RE_Game
{
    static world: RE_Game_World;
    static map: RE_Game_Map;
    static actorUnits: RE_Game_Entity[] = [];

    static createGameObjects(): void {
        this.world = new RE_Game_World();
        this.map = new RE_Game_Map();


        // Create unique units
        RE_Data.actors.forEach(x => {
            const unit = RE_Game_EntityFactory.newActor();
            this.actorUnits.push(unit);
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

