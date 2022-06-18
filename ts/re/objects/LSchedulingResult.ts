import { assert, MRSerializable, tr2 } from "ts/re/Common";
import { SStepPhase } from "../system/SCommon";
import { LActionTokenType } from "./LActionToken";
import { REGame } from "./REGame";


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

    public constructor() {
        this._phaseResults = [];
    }

    public clear(): void {
        for (const phase of this._phaseResults) {
            if (phase) {
                phase.clear();
            }
        }
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
        this.setConsumedActionToken(REGame.scheduler.currentPhaseIndex(), type);
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


