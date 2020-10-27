import { REGame_Map } from "./REGame_Map";
import { REGame_EntityFactory } from "./REGame_EntityFactory";
import { REGame_UnitAttribute } from "./REGame_Attribute";
import { REDataManager } from "./REDataManager";
import { REGame_Entity } from "./REGame_Entity";
import { RE_Game_World } from "./REGame_World";
import { REGame_Core } from "./REGame_Core";
import { REScheduler } from "./REScheduler";
import { REIntegration } from "./REIntegration";
import { REGame_Camera } from "./REGame_Camera";

/**
 * 各 REGame_* インスタンスを保持する。
 * 
 * コアスクリプトの $game* と同じ役割。
 */
export class REGame
{
    static readonly TILE_LAYER_COUNT: number = 6;

    static integration: REIntegration;
    static scheduler: REScheduler;
    static core: REGame_Core;
    static world: RE_Game_World;
    static map: REGame_Map;
    static camera: REGame_Camera;
    static uniqueActorUnits: REGame_Entity[] = [];



}

