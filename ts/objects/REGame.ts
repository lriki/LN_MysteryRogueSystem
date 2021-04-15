import { LMap } from "./LMap";
import { SEntityFactory } from "../system/SEntityFactory";
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
import { LBlock } from "./LBlock";
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
    static map: LMap;
    static camera: LCamera;
    static scheduler: LScheduler;
    static identifyer: LIdentifyer;
    static recorder: RECommandRecorder;
    static messageHistory: LMessageHistory;
    static message: LMessage;
    static eventServer: LEventServer;
    static floorDirector: LFloorDirector;

    // 冒険結果の表示中かどうか
    static challengeResultShowing: boolean = false;

    // マップ有効範囲外に存在するダミー要素
    static borderWall: LBlock = new LBlock(-1, -1);

    /**  */
    static signalFlushSequelSet: ((sequelSet: RESequelSet) => void) | undefined;
}

