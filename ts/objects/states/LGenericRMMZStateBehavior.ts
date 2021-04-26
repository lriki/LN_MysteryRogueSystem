import { SPhaseResult } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { RESystem } from "ts/system/RESystem";
import { DecisionPhase, LBehavior } from "../behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { LState } from "./LState";

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
        if (phase == DecisionPhase.UpdateState) {
            this.updateStateTurns();
            this.removeStatesAuto();
            //this.count++;
            //if (this.count > 2) {
            //    this.removeThisState();
            //}
        }
        
        if (phase == DecisionPhase.Prepare) {
            //console.log("DecisionPhase.Prepare");
            // TEST: 行動スキップ
            //context.postSkipPart(entity);
            return SPhaseResult.Handled;
        }
        else {
            return SPhaseResult.Handled;
        }
    }
}
