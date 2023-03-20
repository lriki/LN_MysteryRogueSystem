import { MRSerializable } from "ts/mr/Common";
import { LThinkingAction } from "./LThinkingAction";

@MRSerializable
export class LThinkingContext {
    private _candidateSctions: LThinkingAction[];

    public constructor() {
        this._candidateSctions = [];
    }

    public get candidateSctions(): readonly LThinkingAction[] {
        return this._candidateSctions;
    }

    public reset(): void {
        this.clearCandidateSctions();
    }

    public clearCandidateSctions(): void {
        this._candidateSctions.length = 0;
    }

    public addCandidateSction(action: LThinkingAction): void {
        this._candidateSctions.push(action);
    }
}

