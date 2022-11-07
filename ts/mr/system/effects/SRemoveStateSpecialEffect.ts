import { DSpecialEffectRef } from "ts/mr/data/DSpecialEffect";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/LEntity";
import { SCommandContext } from "../SCommandContext";
import { SEffect } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SRemoveStateSpecialEffect extends SSpecialEffect {
    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffect, target: LEntity, result: LEffectResult): void {
        if (!data.dataId) return;
        let chance = data.value;
        if (cctx.random().nextIntWithMax(100) < (chance * 100)) {
            target.removeState(data.dataId);
            result.makeSuccess();
        }
    }
}
