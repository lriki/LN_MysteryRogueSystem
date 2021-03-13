import { assert } from "ts/Common";
import { DBehaviorFactory } from "ts/data/DBehaviorFactory";
import { DState, DStateId } from "ts/data/DState";
import { REData } from "ts/data/REData";
import { checkContinuousResponse, REResponse } from "ts/system/RECommand";
import { RESystem } from "ts/system/RESystem";
import { REGame } from "../REGame";
import { REGame_Entity } from "../REGame_Entity";
import { LStateTraitBehavior } from "./LStateTraitBehavior";
import { LStateTrait_GenericRMMZState } from "./LStateTrait_GenericRMMZState";

export class LState {
    private _ownerEntity: REGame_Entity | undefined;    // シリアライズしない
    private _stateId: DStateId;
    private _behabiors: LStateTraitBehavior[];

    public constructor(stateId: DStateId) {
        this._stateId = stateId;
        
        const behavior = new LStateTrait_GenericRMMZState();
        behavior._ownerState = this;
        REGame.world._registerBehavior(behavior);

        this._behabiors = [behavior].concat(this.stateData().traits.map(traitId => {
            const b = DBehaviorFactory.createStateTraitBehavior(traitId);
            b._ownerState = this;
            return b;
        }));
    }

    public stateId(): number {
        return this._stateId;
    }

    public stateData(): DState {
        return REData.states[this._stateId];
    }
    
    public behabiors(): readonly LStateTraitBehavior[] {
        return this._behabiors;
    }

    public ownerEntity(): REGame_Entity {
        assert(this._ownerEntity);
        return this._ownerEntity;
    }

    _setOwnerEntty(entity: REGame_Entity) {
        this._ownerEntity = entity;
    }

    recast(): void {
        // 同じ state が add された

    }
    onAttached(): void {
        this._behabiors.forEach(b => {
            b._ownerEntityId = this.ownerEntity().id();
            b.onAttached();
        });
    }

    onDetached(): void {
        this._behabiors.forEach(b => {
            b.onDetached();
            REGame.world._unregisterBehavior(b);
        });
    }

    public removeThisState(): void {
        this.ownerEntity().removeState(this._stateId);
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

