import { SCommandResponse, SPhaseResult } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { RESystem } from "ts/mr/system/RESystem";
import { DecisionPhase, LBehavior } from "../behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { LState } from "./LState";
import { DAutoRemovalTiming, DState, DStateEffect, DStateRestriction } from "ts/mr/data/DState";
import { assert, MRSerializable } from "ts/mr/Common";
import { REGame } from "../REGame";
import { LConfusionAI, LConfusionAIRestriction } from "../ai/LConfusionAI";
import { LActivity } from "../activities/LActivity";
import { LUnitBehavior } from "../behaviors/LUnitBehavior";
import { MRBasics } from "ts/mr/data/MRBasics";
import { UMovement } from "ts/mr/usecases/UMovement";
import { LBlindAI } from "../ai/LBlindAI";
import { LCharacterAI } from "../ai/LCharacterAI";
import { UName } from "ts/mr/usecases/UName";
import { DSequelId } from "ts/mr/data/DSequel";
import { LActionTokenType } from "../LActionToken";
import { SActivityContext } from "ts/mr/system/SActivityContext";



@MRSerializable
export class LGenericRMMZStateBehavior extends LBehavior {
    _stateTurn: number | null = 0;
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
        const effect = this.stateEffect();

        
        this._stateTurn = null;
        const data = effect.autoRemovals.find(x => x.kind == DAutoRemovalTiming.TurnEnd);
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

    private stateEffect(): DStateEffect {
        const parent = this.parentAs(LState);
        assert(parent);
        return parent.stateEffect();
    }

    onAttached(self: LEntity): void {
        this.resetStateCounts();
        //REGame.eventServer.subscribe(DBasics.events.roomEnterd, this);
        
        const effect = this.stateEffect();
        if (effect.restriction == DStateRestriction.AttackToOther) {
            this._characterAI = new LConfusionAI(LConfusionAIRestriction.AttackToOther);
        }
        else if (effect.restriction == DStateRestriction.Blind) {
            this._characterAI = new LBlindAI();
        }
    }

    onDetached(self: LEntity): void {

    }

    onQueryIdleSequelId(): DSequelId {
        return this.stateData().idleSequel;
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
    
    onDecisionPhase(self: LEntity, cctx: SCommandContext, phase: DecisionPhase): SPhaseResult {
        if (this._characterAI) {
            if (phase == DecisionPhase.AIMinor) {
                return this._characterAI.thinkMoving(cctx, self);
            }
            else if (phase == DecisionPhase.AIMajor) {
                return this._characterAI.thinkAction(cctx, self);
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
            const effect = this.stateEffect();
            if (effect.restriction == DStateRestriction.None) {
                return SPhaseResult.Pass;
            }
            else if (effect.restriction == DStateRestriction.NotAction) {

                //cctx.postConsumeActionToken(self, LActionTokenType.Major);

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
    
    onActivity(self: LEntity, cctx: SCommandContext, actx: SActivityContext): SCommandResponse {
        const state = this.state();
        const traits: IDataTrait[] = [];
        state.collectTraits(self, traits);

        //if (self.traitsWithId(REBasics.traits.SealActivity, activity.actionId()).length > 0) {
        if (traits.find(t => t.code == MRBasics.traits.SealActivity && t.dataId == actx.activity().actionId())) {
            const data = this.stateData();
            const targetName = UName.makeUnitName(self);
            cctx.postMessage(data.message3.format(targetName));
            return SCommandResponse.Canceled;
        }
        return SCommandResponse.Pass;
    }

    onPreprocessActivity(cctx: SCommandContext, activity: LActivity): LActivity {
        const effect = this.stateEffect();
        if (effect.restriction == DStateRestriction.AttackToOther) {
            const unit = activity.actor().findEntityBehavior(LUnitBehavior);
            if (unit && unit.manualMovement()) {    // Player?

                // 歩行移動であれば、方向をランダムにする
                if (activity.actionId() == MRBasics.actions.MoveToAdjacentActionId) {
                    const dir = cctx.random().select(UMovement.directions);
                    activity
                        .withEffectDirection(dir)
                        .withEntityDirection(dir);
                    return activity;
                }

                // 通常攻撃であれば、方向をランダムにする
                if (activity.actionId() == MRBasics.actions.performSkill && activity.skillId() == RESystem.skills.normalAttack) {
                    const dir = cctx.random().select(UMovement.directions);
                    activity.withEntityDirection(dir);
                    return activity;
                }
            }
        }

        return activity;
    }
}
