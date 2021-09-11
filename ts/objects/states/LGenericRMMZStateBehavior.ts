import { REResponse, SPhaseResult } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { RESystem } from "ts/system/RESystem";
import { DecisionPhase, LBehavior } from "../behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { LState } from "./LState";
import { DAutoRemovalTiming, DState, DStateId, DStateRestriction } from "ts/data/DState";
import { assert, tr2 } from "ts/Common";
import { LDecisionBehavior } from "../behaviors/LDecisionBehavior";
import { REGame } from "../REGame";
import { LConfusionAI } from "../ai/LConfusionAI";
import { LActivity } from "../activities/LActivity";
import { LUnitBehavior } from "../behaviors/LUnitBehavior";
import { DBasics } from "ts/data/DBasics";
import { UMovement } from "ts/usecases/UMovement";
import { DParameterId } from "ts/data/DParameter";
import { LBlindAI } from "../ai/LBlindAI";
import { LCharacterAI } from "../ai/LCharacterAI";
import { DTraits } from "ts/data/DTraits";
import { UName } from "ts/usecases/UName";



export class LGenericRMMZStateBehavior extends LBehavior {
    private _stateTurn: number | null = 0;
    //private _persistent: boolean = false;   // 永続ステータス？
    private _characterAI: LCharacterAI | undefined;
    
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

        
        this._stateTurn = null;
        const data = state.autoRemovals.find(x => x.kind == DAutoRemovalTiming.TurnEnd);
        if (data && data.kind === DAutoRemovalTiming.TurnEnd) {
            if (data.minTurns ==  data.maxTurns) {
                this._stateTurn = data.maxTurns;
            }
            else {
                const variance = 1 + Math.max(data.maxTurns - data.minTurns, 0);
                this._stateTurn = data.minTurns + REGame.world.random().nextIntWithMax(variance);
            }
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
    
    private state(): LState {
        const parent = this.parentAs(LState);
        assert(parent);
        return parent;
    }

    private stateData(): DState {
        const parent = this.parentAs(LState);
        assert(parent);
        return parent.stateData();
    }

    onAttached(): void {
        this.resetStateCounts();
        //REGame.eventServer.subscribe(DBasics.events.roomEnterd, this);
        
        const state = this.stateData();
        if (state.restriction == DStateRestriction.AttackToOther) {
            this._characterAI = new LConfusionAI();
        }
        else if (state.restriction == DStateRestriction.Blind) {
            this._characterAI = new LBlindAI();
        }
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

    /*
    onQueryIdealParameterPlus(parameterId: DParameterId): number {
        const data = this.stateData();
        const formula = data.parameterBuffFormulas[parameterId];
        if (formula) {
            const slv = this.state().level();
            try {
                const v = eval(formula);
                return v;
            } catch (e) {
                console.error(e);
                return 0;
            } 
        }

        return 0;
    }
    */
    
    onDecisionPhase(entity: LEntity, context: SCommandContext, phase: DecisionPhase): SPhaseResult {
        if (this._characterAI) {
            if (phase == DecisionPhase.AIMinor) {
                return this._characterAI.thinkMoving(context, entity);
            }
            else if (phase == DecisionPhase.AIMajor) {
                return this._characterAI.thinkAction(context, entity);
            }
        }

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
                //throw new Error("Not implemented.");
                //return SPhaseResult.Handled;
                return SPhaseResult.Pass;
            }
        }
        else {
            return SPhaseResult.Pass;
        }
    }
    
    onActivity(self: LEntity, context: SCommandContext, activity: LActivity): REResponse {
        if (self.traitsWithId(DTraits.SealActivity, activity.actionId()).length > 0) {
            const data = this.stateData();
            const targetName = UName.makeUnitName(self);
            context.postMessage(data.message3.format(targetName));
            return REResponse.Canceled;
        }
        return REResponse.Pass;
    }

    onPreprocessActivity(context: SCommandContext, activity: LActivity): LActivity {
        const state = this.stateData();
        if (state.restriction == DStateRestriction.AttackToOther) {
            const unit = activity.subject().findEntityBehavior(LUnitBehavior);
            if (unit && unit.manualMovement()) {    // Player?

                // 歩行移動であれば、方向をランダムにする
                if (activity.actionId() == DBasics.actions.MoveToAdjacentActionId) {
                    const dir = context.random().select(UMovement.directions);
                    activity
                        .withDirection(dir)
                        .withEntityDirection(dir);
                    return activity;
                }

                // 通常攻撃であれば、方向をランダムにする
                if (activity.actionId() == DBasics.actions.performSkill && activity.skillId() == RESystem.skills.normalAttack) {
                    const dir = context.random().select(UMovement.directions);
                    activity.withEntityDirection(dir);
                    return activity;
                }
            }
        }

        return activity;
    }
}
