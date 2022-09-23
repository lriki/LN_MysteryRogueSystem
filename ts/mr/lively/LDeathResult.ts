import { MRSerializable } from "../Common";
import { DStateId } from "../data/DState";

@MRSerializable
export class LDeathResult {
    private _states: DStateId[];

    public constructor() {
        this._states = [];
    }

    public clear(): void {
        this._states = [];
    }

    public clearStates(): void {
        this._states = [];
    }

    public addState(id: DStateId): void {
        this._states.push(id);
    }
    
    public states(): readonly DStateId[] {
        return this._states;
    }
}
