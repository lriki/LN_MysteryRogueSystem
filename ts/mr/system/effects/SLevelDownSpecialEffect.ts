import { DSpecificEffectId } from "ts/mr/data/DCommon";
import { DSpecialEffectRef } from "ts/mr/data/DEffect";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LBattlerBehavior } from "ts/mr/objects/behaviors/LBattlerBehavior";
import { LExperienceBehavior } from "ts/mr/objects/behaviors/LExperienceBehavior";
import { LEffectResult } from "ts/mr/objects/LEffectResult";
import { LEntity } from "ts/mr/objects/LEntity";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SLevelDownSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        if (target.actualParam(MRBasics.params.level) > 1) {
            target.gainActualParam(MRBasics.params.level, -1, false);
            result.leveldown = true;
            result.makeSuccess();
        }
    }
}