import { assert, MRSerializable } from "../Common";
import { DLandId } from "../data/DCommon";
import { LandExitResult } from "../data/MRData";
import { MRSystem } from "../system/MRSystem";

/**
 * ひとつの "冒険" に関する情報を表現するクラス
 * 
 * World から Land に入ったときに初期化される。
 * Land 間移動では初期化されない。
 */
 @MRSerializable
export class LJournal {
    private _entranceLandId: DLandId;
    private _exitResult: LandExitResult;

    public constructor() {
        this._entranceLandId = 0;
        this._exitResult = LandExitResult.Ongoing;
    }

    /** 最期の冒険の結果。次の冒険を開始するまでは値は維持される。 */
    public get exitResult(): LandExitResult {
        return this._exitResult;
    }

    public get exitResultSummary(): number {
        return this._exitResult / 100;
    }
    
    /** 冒険の継続中であるか */
    public get isChallengeOngoing(): boolean {
        return this.exitResultSummary <= 1;
    }

    /** 冒険開始 */
    public startChallenge(entryLandId: DLandId): void {
        this._entranceLandId = entryLandId;
        this._exitResult = LandExitResult.Ongoing;
    }

    /** 冒険終了 */
    public finishChallenge(result: LandExitResult): void {
        assert(this.isChallengeOngoing);
        this._exitResult = result;
        MRSystem.integration.onSetLandExitResult(result);
    }
}
