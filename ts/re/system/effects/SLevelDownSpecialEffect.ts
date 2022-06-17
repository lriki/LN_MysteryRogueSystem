import { DSpecificEffectId } from "ts/re/data/DCommon";
import { DSpecialEffectRef } from "ts/re/data/DEffect";
import { MRBasics } from "ts/re/data/MRBasics";
import { LBattlerBehavior } from "ts/re/objects/behaviors/LBattlerBehavior";
import { LExperienceBehavior } from "ts/re/objects/behaviors/LExperienceBehavior";
import { LEffectResult } from "ts/re/objects/LEffectResult";
import { LEntity } from "ts/re/objects/LEntity";
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
