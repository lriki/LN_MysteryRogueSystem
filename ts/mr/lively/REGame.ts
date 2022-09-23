import { LMap } from "./LMap";
import { LWorld } from "./LWorld";
import { LSystem } from "./LSystem";
import { LCamera } from "./LCamera";
import { SActivityRecorder } from "ts/mr/system/SActivityRecorder";
import { LMessageHistory } from "./LMessageHistory";
import { LIdentifyer } from "./LIdentifyer";
import { SSequelSet } from "../system/SSequel";
import { SImmediatelyCommandExecuteScheduler } from "ts/mr/system/SImmediatelyCommandExecuteScheduler";
import { LEventServer } from "./LEventServer";
import { LBlock } from "./LBlock";
import { LScheduler2 } from "./LScheduler";
import { MRGameExtension } from "./MRGameExtension";

/**
 * 各 REGame_* インスタンスを保持する。
 * 
 * コアスクリプトの $game* と同じ役割。
 */
export class REGame
{
    static readonly TILE_LAYER_COUNT: number = 6;

    static ext: MRGameExtension = new MRGameExtension();
    static immediatelyCommandExecuteScheduler: SImmediatelyCommandExecuteScheduler;
    static system: LSystem;
    static world: LWorld;
    static map: LMap;
    static camera: LCamera;
    static scheduler: LScheduler2;
    static identifyer: LIdentifyer;
    static recorder: SActivityRecorder;
    static messageHistory: LMessageHistory;
    static eventServer: LEventServer;

    // 冒険結果の表示中かどうか
    static challengeResultShowing: boolean = false;

    // マップ有効範囲外に存在するダミー要素
    static borderWall: LBlock;

    /**  */
    static signalFlushSequelSet: ((sequelSet: SSequelSet) => void) | undefined;
}

