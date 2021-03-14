import { assert } from "ts/Common";
import { DBehaviorFactory } from "ts/data/DBehaviorFactory";
import { DState, DStateId } from "ts/data/DState";
import { REData } from "ts/data/REData";
import { checkContinuousResponse, REResponse } from "ts/system/RECommand";
import { RESystem } from "ts/system/RESystem";
import { LObject, LObjectType } from "../LObject";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { LStateTraitBehavior } from "./LStateTraitBehavior";
import { LStateTrait_GenericRMMZState } from "./LStateTrait_GenericRMMZState";

/**
 * Entity に着脱するステートの単位。
 * 
 * RE において State とは、StateBehavior をグループ化するもの。
 * StateBehavior は仮眠、鈍足など具体的な処理を定義する。
 * 
 * グループ化の仕組みにより、例えば "透視状態になるがハラヘリ速度が倍になる" といった
 * カスタマイズを施しやすくなる。
 * 
 * 振舞いは Ability と非常によく似ているが、State は RMMZ のステートと同じく状態異常を主に表すものであり、
 * 特徴的なところだと "全快" するアイテムやイベントによってすべてでタッチされたりする。
 */
export class LState extends LObject {
    private _ownerEntity: LEntity | undefined;    // シリアライズしない
    private _stateId: DStateId;
    private _behabiors: LStateTraitBehavior[];

    public constructor(stateId: DStateId) {
        super(LObjectType.State);
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

    public ownerEntity(): LEntity {
        assert(this._ownerEntity);
        return this._ownerEntity;
    }

    _setOwnerEntty(entity: LEntity) {
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

