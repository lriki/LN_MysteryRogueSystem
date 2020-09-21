import { REGame_Map } from "./REGame_Map";
import { REGame_EntityFactory } from "./REGame_EntityFactory";
import { RE_Game_UnitAttribute } from "./REGame_Attribute";
import { REDataManager } from "./REDataManager";
import { RE_Game_Entity } from "./REGame_Entity";
import { RE_Game_World } from "./REGame_World";
import { REGame_Core } from "./REGame_Core";

/**
 * 各 REGame_* インスタンスを保持する。
 * 
 * コアスクリプトの $game* と同じ役割。
 */
export class REGame
{
    static readonly TILE_LAYER_COUNT: number = 6;

    static core: REGame_Core;
    static world: RE_Game_World;
    static map: REGame_Map;
    static actorUnits: RE_Game_Entity[] = [];



}

