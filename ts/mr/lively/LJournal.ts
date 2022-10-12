import { assert, MRSerializable } from "../Common";
import { DLandId } from "../data/DCommon";
import { LandExitResult } from "../data/MRData";
import { MRSystem } from "../system/MRSystem";

export enum LChallengingStatus {
    None = 0,
    Challenging = 1,
}

/**
 * ひとつの "冒険" に関する情報を表現するクラス
 * 
 * World から Land に入ったときに初期化される。
 * Land 間移動では初期化されない。
 */
 @MRSerializable
export class LJournal {
    private _status: LChallengingStatus;
    private _exitResult: LandExitResult;
    //private _entranceLandId: DLandId;

    public constructor() {
        this._status = LChallengingStatus.None;
        this._exitResult = LandExitResult.Challenging;
        //this._entranceLandId = 0;
    }

    /** 最期の冒険の結果。次の冒険を開始するまでは値は維持される。 */
    public get exitResult(): LandExitResult {
        return this._exitResult;
    }

    public get exitResultSummary(): number {
        return this._exitResult / 100;
    }
    
    /** 冒険の継続中であるか */
    public get isChallenging(): boolean {
        return this._status == LChallengingStatus.Challenging;
    }

    /** ゲームオーバーなど、ペナルティを伴う挑戦結果であるか。 */
    public get isPenaltyResult(): boolean {
        return LandExitResult.Gameover <= this._exitResult;
    }

    /** 冒険開始。基本的に拠点での起床時に開始する。拠点マップ(World)に居る時も、冒険中とみなす。（倉庫とかで倒れたりするので） */
    public startChallenging(/*entryLandId: DLandId*/): void {
        // 複数回に実行は許可する。
        //this._entranceLandId = entryLandId;
        this._exitResult = LandExitResult.Challenging;
        this._status = LChallengingStatus.Challenging;
    }

    /** 冒険終了 */
    public finishChallenging(): void {
        this._status = LChallengingStatus.None;
    }

    /** 何らかの理由で Land から離脱 */
    public commitLandResult(result: LandExitResult): void {
        this._exitResult = result;
        MRSystem.integration.onSetLandExitResult(result);
    }

    // finishChallenge
}
