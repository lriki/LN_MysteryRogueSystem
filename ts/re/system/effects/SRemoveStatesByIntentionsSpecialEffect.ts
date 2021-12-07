import { DSpecificEffectId } from "ts/re/data/DCommon";
import { DSpecialEffectRef } from "ts/re/data/DEffect";
import { DStateIntentions } from "ts/re/data/DState";
import { LBattlerBehavior } from "ts/re/objects/behaviors/LBattlerBehavior";
import { LEffectResult } from "ts/re/objects/LEffectResult";
import { LEntity } from "ts/re/objects/LEntity";
import { UAction } from "ts/re/usecases/UAction";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SRemoveStatesByIntentionsSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        const intentions = data.value as DStateIntentions;
        const removeStateIds = target.states()
            .filter(x => (x.stateData().intentions & intentions) === intentions)
            .map(x => x.stateDataId());
        if (removeStateIds.length > 0) {
            target.removeStates(removeStateIds);
            result.makeSuccess();
        }
    }
}
