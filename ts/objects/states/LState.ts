import { DBehaviorFactory } from "ts/data/DBehaviorFactory";
import { DState, DStateId } from "ts/data/DState";
import { REData } from "ts/data/REData";
import { checkContinuousResponse, REResponse } from "ts/system/RECommand";
import { RESystem } from "ts/system/RESystem";
import { LStateTraitBehavior } from "./LStateTraitBehavior";

export class LState {
    private _stateId: DStateId;
    private _behabiors: LStateTraitBehavior[];

    public constructor(stateId: DStateId) {
        this._stateId = stateId;
        this._behabiors = this.state().traits.map(traitId => DBehaviorFactory.createStateTraitBehavior(traitId));
        console.log("LState", this);
    }

    public stateId(): number {
        return this._stateId;
    }

    public state(): DState {
        return REData.states[this._stateId];
    }

    public recast(): void {
        // 同じ state が add された

    }
    
    _callStateIterationHelper(func: (x: LStateTraitBehavior) => REResponse): REResponse {
        let response = REResponse.Pass;
        for (let i = this._behabiors.length - 1; i >= 0; i--) {
            const r = func(this._behabiors[i]);
            if (r != REResponse.Pass) {
                response = r;
            }
            if (checkContinuousResponse(r)) {
                break;
            }
        }
        return response;
    }
}

