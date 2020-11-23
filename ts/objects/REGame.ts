import { REGame_Map } from "./REGame_Map";
import { REEntityFactory } from "../system/REEntityFactory";
import { REDataManager } from "../data/REDataManager";
import { REGame_Entity } from "./REGame_Entity";
import { RE_Game_World } from "./REGame_World";
import { REGame_Core } from "./REGame_Core";
import { REScheduler } from "../system/REScheduler";
import { REIntegration } from "../system/REIntegration";
import { REGame_Camera } from "../objects/REGame_Camera";
import { REGame_System } from "../objects/REGame_System";
import { RECommandRecorder } from "ts/system/RECommandRecorder";

/**
 * 各 REGame_* インスタンスを保持する。
 * 
 * コアスクリプトの $game* と同じ役割。
 */
export class REGame
{
    static readonly TILE_LAYER_COUNT: number = 6;

    static scheduler: REScheduler;
    static core: REGame_Core;
    static system: REGame_System;
    static world: RE_Game_World;
    static map: REGame_Map;
    static camera: REGame_Camera;
    static uniqueActorUnits: REGame_Entity[] = [];
    static recorder: RECommandRecorder;

    // 冒険結果の表示中かどうか
    static challengeResultShowing: boolean = false;


}

