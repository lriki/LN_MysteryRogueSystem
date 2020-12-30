import { DBehaviorFactory } from "ts/data/DBehaviorFactory";
import { DState, DStateId } from "ts/data/DState";
import { REData } from "ts/data/REData";
import { checkContinuousResponse, REResponse } from "ts/system/RECommand";
import { RESystem } from "ts/system/RESystem";
import { REGame } from "../REGame";
import { LStateTraitBehavior } from "./LStateTraitBehavior";

export class LState {
    private _stateId: DStateId;
    private _behabiors: LStateTraitBehavior[];

    public constructor(stateId: DStateId) {
        this._stateId = stateId;
        this._behabiors = this.stateData().traits.map(traitId => DBehaviorFactory.createStateTraitBehavior(traitId));
    }

    public stateId(): number {
        return this._stateId;
    }

    public stateData(): DState {
        return REData.states[this._stateId];
    }

    recast(): void {
        // 同じ state が add された

    }
    onAttached(): void {
        this._behabiors.forEach(b => b.onAttached());
    }

    onDetached(): void {
        this._behabiors.forEach(b => {
            b.onDetached();
            REGame.world._unregisterBehavior(b);
        });
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

