import { DActionId } from "ts/re/data/DAction";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { DecisionPhase, LBehavior } from "./LBehavior";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { SActivityContext } from "ts/re/system/SActivityContext";
import { SCommandResponse, SPhaseResult } from "ts/re/system/RECommand";
import { REBasics } from "ts/re/data/REBasics";
import { USearch } from "ts/re/usecases/USearch";
import { DEmittor } from "ts/re/data/DEmittor";
import { DCounterAction } from "ts/re/data/DEntity";
import { LEffectResult } from "../LEffectResult";
import { SEmittorPerformer } from "ts/re/system/SEmittorPerformer";
import { REData } from "ts/re/data/REData";




/**
 * 全 Entity に共通するもの。
 * 
 * ひとまず、一般的ではないかもしれないけど、検証用途や一時的にここに機能を置くこともある。
 * というか現状何が本当に必要なのか不透明な状態なので、あるていど機能のまとまりが見えてきたら派生クラス作って分離していく。
 */
export class LCommonBehavior extends LBehavior {
    reservedCounterActionIndex = -1;

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LCommonBehavior);
        return b
    }

    onQueryActions(actions: DActionId[]): DActionId[] {
        return actions;
    }
    
    onActivity(self: LEntity, cctx: SCommandContext, actx: SActivityContext): SCommandResponse {
        const activity = actx.activity();
        
        if (activity.actionId() == REBasics.actions.FallActionId) {
            const target = USearch.getFirstUnderFootEntity(self);
            if (target) {
                actx.postHandleActivity(cctx, target);
                return SCommandResponse.Handled;
            }
        }
        return SCommandResponse.Handled;
    }
    
    onDecisionPhase(self: LEntity, cctx: SCommandContext, phase: DecisionPhase): SPhaseResult {
        
        if (phase == DecisionPhase.UpdateState) {
            for (const trait of self.traits(REBasics.traits.SuddenSkillEffect)) {
                const chance = trait.value;
                if (cctx.random().nextIntWithMax(100) < (chance * 100)) {
                    const skill = REData.skills[trait.dataId];
                    SEmittorPerformer.makeWithEmitor(self, self, skill.emittor())
                    .perform(cctx);
                }
            }

            return SPhaseResult.Pass;
        }

        return SPhaseResult.Pass;
    }

    onEffectPerformed(self: LEntity, cctx: SCommandContext, emittor: DEmittor): SCommandResponse {
        const data = self.data();

        if (this.reservedCounterActionIndex < 0) {
            for (const [i, act] of data.counterActions.entries()) {
                if (this.meetsCounterActionConditions(act, self._effectResult)) {
                    this.reservedCounterActionIndex = i;
                    break;
                }
            }
        }

        return SCommandResponse.Pass; 
    }

    onStabilizeSituation(self: LEntity, cctx: SCommandContext): SCommandResponse {

        // 反撃相当の処理は Scheduler の特定のタイミングではなく、コマンドチェーンが完了した時に行う。
        // こうしないと、例えば地雷が連続で誘爆していくとき、1ステップ内で繰り返し performTrapEffect() を呼び出せない。
        if (this.reservedCounterActionIndex >= 0) {
            const data = self.data();
            self.iterateBehaviorsReverse(b => {
                return b.onCounterAction(self, cctx, data.counterActions[this.reservedCounterActionIndex]) == SCommandResponse.Pass;
            });
            this.reservedCounterActionIndex = -1;
        }

        return SCommandResponse.Pass;
    }
    
    private meetsCounterActionConditions(data: DCounterAction, effectResult: LEffectResult): boolean {
        if (data.conditionAttackType) {
            if (effectResult.sourceEffect) {
                const elementId = data.conditionAttackType;
                if (effectResult.sourceEffect.parameterQualifyings.find(x => x.elementIds.includes(elementId))) {
                    return true;
                }
                
            }
            
            // if (effectResult.paramEffects2.find(x => x.qualifying.elementId == data.conditionAttackType)) {
            //     return true;
            // }
        }
        return false;
    }
    
}

