import { assert, MRSerializable, tr2 } from "ts/mr/Common";
import { SStepPhase } from "../system/SCommon";
import { LActionTokenType } from "./LActionToken";
import { MRLively } from "./MRLively";


@MRSerializable
export class LPhaseResult {
    // この Phase で消費されたトークンの種類 (Major は Minor を兼ねる)
    consumedActionToken: LActionTokenType | undefined;

    public clear(): void {
        this.consumedActionToken = undefined;
    }
}


@MRSerializable
export class LSchedulingResult {
    private _phaseResults: (LPhaseResult | undefined)[];

    // UpdateState を実行したかどうか。
    // Enemy は、Minor または Major のどちらかのトークンを消費した場合に UpdateState を実行する。
    public stateUpdatedInRun: boolean;

    public constructor() {
        this._phaseResults = [];
        this.stateUpdatedInRun = false;
    }

    public clear(): void {
        for (const phase of this._phaseResults) {
            if (phase) {
                phase.clear();
            }
        }
        this.stateUpdatedInRun = false;
    }

    public setConsumedActionToken(phaseIndex: number, type: LActionTokenType): void {
        const phase = this.acquirePhaseResult(phaseIndex);
        if (type == LActionTokenType.Major) {
            phase.consumedActionToken = type;
        }
        else if (type == LActionTokenType.Minor && phase.consumedActionToken === undefined) {
            phase.consumedActionToken = type;
        }
    }

    public setConsumedActionTokeInCurrentPhase(type: LActionTokenType): void {
        this.setConsumedActionToken(MRLively.scheduler.currentPhaseIndex(), type);
    }

    public consumedActionToken(phaseIndex: number): LActionTokenType | undefined {
        const phase = this._phaseResults[phaseIndex];
        if (!phase) return undefined;
        return phase.consumedActionToken;
    }

    // public consumedActionTokenInCurrentPhase(type: LActionTokenType): LActionTokenType | undefined {
    //     return this.setConsumedActionToken(REGame.scheduler.currentPhaseIndex(), type);
    // }

    private acquirePhaseResult(phaseIndex: number): LPhaseResult {
        if (phaseIndex >= this._phaseResults.length ||
            this._phaseResults[phaseIndex] == undefined) {
            const newData = new LPhaseResult();
            this._phaseResults[phaseIndex] = newData;
            return newData;
        }
        const data = this._phaseResults[phaseIndex];
        assert(data);
        return data;
    }
}


