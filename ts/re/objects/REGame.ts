import { LMap } from "./LMap";
import { LWorld } from "./LWorld";
import { LSystem } from "./LSystem";
import { LCamera } from "./LCamera";
import { SActivityRecorder } from "ts/re/system/SActivityRecorder";
import { LMessage } from "./LMessage";
import { LMessageHistory } from "./LMessageHistory";
import { LIdentifyer } from "./LIdentifyer";
import { SSequelSet } from "../system/SSequel";
import { SImmediatelyCommandExecuteScheduler } from "ts/re/system/SImmediatelyCommandExecuteScheduler";
import { LEventServer } from "./LEventServer";
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
    static recorder: SActivityRecorder;
    static messageHistory: LMessageHistory;
    static message: LMessage;
    static eventServer: LEventServer;
    static floorDirector: LFloorDirector;

    // 冒険結果の表示中かどうか
    static challengeResultShowing: boolean = false;

    // マップ有効範囲外に存在するダミー要素
    static borderWall: LBlock;

    /**  */
    static signalFlushSequelSet: ((sequelSet: SSequelSet) => void) | undefined;
}

