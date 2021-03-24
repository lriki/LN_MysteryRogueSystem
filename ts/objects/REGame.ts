import { REGame_Map } from "./REGame_Map";
import { REEntityFactory } from "../system/REEntityFactory";
import { REDataManager } from "../data/REDataManager";
import { LEntity } from "./LEntity";
import { LWorld } from "./LWorld";
import { LSystem } from "./LSystem";
import { SScheduler } from "../system/SScheduler";
import { REIntegration } from "../system/REIntegration";
import { LCamera } from "./LCamera";
import { RECommandRecorder } from "ts/system/RECommandRecorder";
import { LMessage } from "./LMessage";
import { LMessageHistory } from "./LMessageHistory";
import { LIdentifyer } from "./LIdentifyer";
import { RESequelSet } from "./REGame_Sequel";
import { SImmediatelyCommandExecuteScheduler } from "ts/system/SImmediatelyCommandExecuteScheduler";
import { LEventServer } from "./LEventServer";
import { SMinimapData } from "ts/system/SMinimapData";
import { LFloorDirector } from "./LFloorDirector";
import { REGame_Block } from "./REGame_Block";
import { LScheduler } from "./LScheduler";

/**
 * 各 REGame_* インスタンスを保持する。
 * 
 * コアスクリプトの $game* と同じ役割。
 */
export class REGame
{
    static readonly TILE_LAYER_COUNT: number = 6;

    static immediatelyCommandExecuteScheduler: SImmediatelyCommandExecuteScheduler;
    static system: LSystem;
    static world: LWorld;
    static map: REGame_Map;
    static camera: LCamera;
    static scheduler: LScheduler;
    static recorder: RECommandRecorder;
    static messageHistory: LMessageHistory;
    static message: LMessage;
    static identifyer: LIdentifyer;
    static eventServer: LEventServer;
    static minimapData: SMinimapData;
    static floorDirector: LFloorDirector;

    // 冒険結果の表示中かどうか
    static challengeResultShowing: boolean = false;

    // マップ有効範囲外に存在するダミー要素
    static borderWall: REGame_Block = new REGame_Block(-1, -1);

    /**  */
    static signalFlushSequelSet: ((sequelSet: RESequelSet) => void) | undefined;
}

