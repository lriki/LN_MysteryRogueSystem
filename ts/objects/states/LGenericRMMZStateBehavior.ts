import { SPhaseResult } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { RESystem } from "ts/system/RESystem";
import { DecisionPhase, LBehavior } from "../behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { LState } from "./LState";
import { DAutoRemovalTiming, DState, DStateId, DStateRestriction } from "ts/data/DState";
import { assert } from "ts/Common";
import { LDecisionBehavior } from "../behaviors/LDecisionBehavior";
import { REGame } from "../REGame";

export class LGenericRMMZStateBehavior extends LBehavior {
    private _stateTurn: number | null = 0;
    //private _persistent: boolean = false;   // 永続ステータス？
    
    constructor() {
        super();
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LGenericRMMZStateBehavior);
        b._stateTurn = this._stateTurn;
        return b
    }
    
    // Game_BattlerBase.prototype.isStateExpired 
    private isStateExpired(): boolean {
        return this._stateTurn !== null && this._stateTurn <= 0;
    }

    // Game_BattlerBase.prototype.resetStateCounts
    private resetStateCounts(): void {
        const state = this.stateData();
        
        if (state.autoRemovalTiming == DAutoRemovalTiming.None) {
            this._stateTurn = null;
        }
        else if (state.autoRemovalTiming == DAutoRemovalTiming.TurnEnd) {
            if (state.minTurns ==  state.maxTurns) {
                this._stateTurn = state.maxTurns;
            }
            else {
                const variance = 1 + Math.max(state.maxTurns - state.minTurns, 0);
                this._stateTurn = state.minTurns + REGame.world.random().nextIntWithMax(variance);
            }
        }
        else {
            throw new Error("Not implemented");
        }
    }

    private updateStateTurns(): void {
        if (this._stateTurn && this._stateTurn > 0) {
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
        this.resetStateCounts();
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
        else if (phase == DecisionPhase.Manual ||
            phase == DecisionPhase.AIMinor ||
            phase == DecisionPhase.AIMajor) {
            const state = this.stateData();
            if (state.restriction == DStateRestriction.None) {
                return SPhaseResult.Pass;
            }
            else if (state.restriction == DStateRestriction.NotAction) {

                context.postConsumeActionToken(entity);

                // 行動スキップ
                return SPhaseResult.Handled;
            }
            else {
                throw new Error("Not implemented.");
                return SPhaseResult.Handled;
            }
        }
        else {
            return SPhaseResult.Pass;
        }
    }
}
