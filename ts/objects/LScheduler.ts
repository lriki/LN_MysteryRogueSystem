
export class LScheduler {
    private _currentPhaseIndex: number = 0;

    public currentPhaseIndex(): number {
        return this._currentPhaseIndex;
    }

    public resetPhaseIndex(): void {
        this._currentPhaseIndex = 0;
    }

    public advancePhaseIndex(): void {
        this._currentPhaseIndex++;
    }
}

