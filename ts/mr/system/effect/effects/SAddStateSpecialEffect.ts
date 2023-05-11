import { DSpecialEffectRef } from "ts/mr/data/DSpecialEffect";
import { DStateId } from "ts/mr/data/DState";
import { MRData } from "ts/mr/data/MRData";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { LRandom } from "ts/mr/lively/LRandom";
import { UState } from "ts/mr/utility/UState";
import { SCommandContext } from "../../SCommandContext";
import { SEffect } from "../../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SAddStateSpecialEffect extends SSpecialEffect {
    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffect, target: LEntity, result: LEffectResult): void {
        SAddStateSpecialEffect.itemEffectAddState(target, modifier, data, cctx.random(), result);
    }
    
    // Game_Action.prototype.itemEffectAddState
    public static itemEffectAddState(target: LEntity, effect: SEffect, effectRef: DSpecialEffectRef, rand: LRandom, result: LEffectResult): void {
        if (effectRef.dataId === 0) {
            // ID=0 は "通常攻撃" という特殊な状態付加となる。
            // RESystem としては処理不要。
        } else {
            this.itemEffectAddNormalState(target, effect, effectRef, rand, result);
        }
    }

    // Game_Action.prototype.itemEffectAddNormalState
    public static itemEffectAddNormalState(target: LEntity, effect: SEffect, effectRef: DSpecialEffectRef, rand: LRandom, result: LEffectResult): void {
        const stateData = MRData.states[effectRef.dataId];

        // そもそもステート無効化を持っている場合は追加自体行わない。
        // RMMZ標準では、一度追加した後の refresh で remove している。
        // ただこれだと makeSuccess() が動いてしまうので、いらないメッセージが出てしまう。
        const stateAddable = target.isStateAddable(effectRef.dataId);
        if (!stateAddable) return;

        if (!UState.meetsApplyConditions(stateData, target)) {
            return;
        }

        let chance = effectRef.value;
        if (!effect.isCertainHit()) {
            chance *= target.stateRate(effectRef.dataId);
            chance *= effect.lukEffectRate(target);
        }

        if (rand.nextIntWithMax(100) < (chance * 100)) {
            SAddStateSpecialEffect.addState(target, effectRef.dataId, result);
        }
    }

    public static addState(target: LEntity, stateId: DStateId, result: LEffectResult) {
        target.addState(stateId);
        result.makeSuccess();

        const stateData = MRData.states[stateId];
        if (stateData.deadState) {
            result.clearParamEffects();
        }
    }
}
