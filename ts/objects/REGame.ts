import { REGame_Map } from "./REGame_Map";
import { REEntityFactory } from "../system/REEntityFactory";
import { REDataManager } from "../data/REDataManager";
import { LEntity } from "./LEntity";
import { RE_Game_World } from "./REGame_World";
import { REGame_Core } from "./REGame_Core";
import { REScheduler } from "../system/REScheduler";
import { REIntegration } from "../system/REIntegration";
import { REGame_Camera } from "../objects/REGame_Camera";
import { REGame_System } from "../objects/REGame_System";
import { RECommandRecorder } from "ts/system/RECommandRecorder";
import { LMessage } from "./LMessage";
import { LMessageHistory } from "./LMessageHistory";
import { LIdentifyer } from "./LIdentifyer";
import { RESequelSet } from "./REGame_Sequel";
import { SImmediatelyCommandExecuteScheduler } from "ts/system/SImmediatelyCommandExecuteScheduler";
import { LEventServer } from "./LEventServer";
import { SMinimapData } from "ts/system/SMinimapData";
import { LFloorDirector } from "./LFloorDirector";

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
    static immediatelyCommandExecuteScheduler: SImmediatelyCommandExecuteScheduler;
    static core: REGame_Core;
    static system: REGame_System;
    static world: RE_Game_World;
    static map: REGame_Map;
    static camera: REGame_Camera;
    static uniqueActorUnits: LEntity[] = [];
    static recorder: RECommandRecorder;
    static messageHistory: LMessageHistory;
    static message: LMessage;
    static identifyer: LIdentifyer;
    static eventServer: LEventServer;
    static minimapData: SMinimapData;
    static floorDirector: LFloorDirector;

    // 冒険結果の表示中かどうか
    static challengeResultShowing: boolean = false;

    /**  */
    static signalFlushSequelSet: ((sequelSet: RESequelSet) => void) | undefined;
}

