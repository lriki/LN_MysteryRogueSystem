import { DSpecialEffectRef } from "ts/mr/data/DSpecialEffect";
import { DStateIntentions } from "ts/mr/data/DState";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { SCommandContext } from "../SCommandContext";
import { SEffect } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SRemoveStatesByIntentionsSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffect, target: LEntity, result: LEffectResult): void {
        const intentions = data.value as DStateIntentions;
        const removeStateIds = target.states
            .filter(x => (x.stateData().intentions & intentions) === intentions)
            .map(x => x.stateDataId());
        if (removeStateIds.length > 0) {
            target.removeStates(removeStateIds);
            result.makeSuccess();
        }
    }
}
