import { SPhaseResult } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { RESystem } from "ts/system/RESystem";
import { DecisionPhase, LBehavior } from "../behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { LState } from "./LState";
import { DState, DStateId, DStateRestriction } from "ts/data/DState";
import { assert } from "ts/Common";

export class LGenericRMMZStateBehavior extends LBehavior {
    private _stateTurn: number = 0;
    
    constructor() {
        super();
        this.resetStateCounts();
    }
    
    // Game_BattlerBase.prototype.isStateExpired 
    private isStateExpired(): boolean {
        return this._stateTurn <= 0;
    }

    // Game_BattlerBase.prototype.resetStateCounts
    private resetStateCounts(): void {
        //const state = $dataStates[stateId];
        //const variance = 1 + Math.max(state.maxTurns - state.minTurns, 0);
        //this._stateTurns[stateId] = state.minTurns + Math.randomInt(variance);
        this._stateTurn = 10;
    }

    private updateStateTurns(): void {
        if (this._stateTurn > 0) {
            this._stateTurn--;
        }
    }

    // Game_Battler.prototype.removeStatesAuto
    private removeStatesAuto(): void {
        if (this.isStateExpired()) {
            //this.removeThisState();
            this.parentAs(LState)?.removeThisState();
        }
    }
    
    private stateData(): DState {
        const parent = this.parentAs(LState);
        assert(parent);
        return parent.stateData();
    }

    onAttached(): void {
        //console.log("LStateTrait_GenericRMMZState");
        //REGame.eventServer.subscribe(DBasics.events.roomEnterd, this);
    }

    onDetached(): void {

    }

    onQueryProperty(propertyId: number): any {
        //console.log("LStateTrait_GenericRMMZState onQueryProperty");
        //throw new Error("LStateTrait_Nap onQueryProperty");

        if (propertyId == RESystem.properties.idleSequel)
            return RESystem.sequels.asleep;
        else
            return super.onQueryProperty(propertyId);
    }

    //count = 0;
    
    onDecisionPhase(entity: LEntity, context: SCommandContext, phase: DecisionPhase): SPhaseResult {
        // 解除判定
        if (phase == DecisionPhase.UpdateState) {
            this.updateStateTurns();
            this.removeStatesAuto();
            //this.count++;
            //if (this.count > 2) {
            //    this.removeThisState();
            //}
            return SPhaseResult.Pass;
        }
        else {
            const state = this.stateData();
            if (state.restriction == DStateRestriction.None) {
                return SPhaseResult.Pass;
            }
            else if (state.restriction == DStateRestriction.NotAction) {
                // 行動スキップ
                return SPhaseResult.Handled;
            }
            else {
                throw new Error("Not implemented.");
                return SPhaseResult.Handled;
            }
        }
    }
}
