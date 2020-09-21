import { REGame_Map } from "./REGame_Map";
import { RE_Game_EntityFactory } from "./REGame_EntityFactory";
import { RE_Game_UnitAttribute, RE_Game_PositionalAttribute } from "./REGame_Attribute";
import { RE_DataManager, RE_Data } from "./RE_DataManager";
import { RE_Game_Entity } from "./REGame_Entity";
import { RE_Game_World } from "./REGame_World";

/**
 * 各 REGame_* インスタンスを保持する。
 * 
 * コアスクリプトの $game* と同じ役割。
 */
export class REGame
{
    static readonly TILE_LAYER_COUNT: number = 6;

    static world: RE_Game_World;
    static map: REGame_Map;
    static actorUnits: RE_Game_Entity[] = [];



}

