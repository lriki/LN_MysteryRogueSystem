import { DSpecificEffectId } from "ts/mr/data/DCommon";
import { DSpecialEffectRef } from "ts/mr/data/DEffect";
import { LBattlerBehavior } from "ts/mr/objects/behaviors/LBattlerBehavior";
import { LEffectResult } from "ts/mr/objects/LEffectResult";
import { LEntity } from "ts/mr/objects/LEntity";
import { UAction } from "ts/mr/usecases/UAction";
import { RESystem } from "../RESystem";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class STrapProliferationSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        RESystem.mapManager.spawnTraps(30);
        result.makeSuccess();
    }

}
