import { DSpecialEffectRef } from "ts/mr/data/DEffect";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/LEntity";
import { MRSystem } from "../MRSystem";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class STrapProliferationSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        MRSystem.mapManager.spawnTraps(30);
        result.makeSuccess();
    }

}
