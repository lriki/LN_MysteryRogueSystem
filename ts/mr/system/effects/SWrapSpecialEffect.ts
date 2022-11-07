import { DSpecialEffectRef } from "ts/mr/data/DSpecialEffect";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/LEntity";
import { UAction } from "ts/mr/utility/UAction";
import { SCommandContext } from "../SCommandContext";
import { SEffect } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SWarpSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffect, target: LEntity, result: LEffectResult): void {
        UAction.postWarp(cctx, target);
        result.makeSuccess();
    }

}
