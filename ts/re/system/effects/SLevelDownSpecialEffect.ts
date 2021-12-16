import { DSpecificEffectId } from "ts/re/data/DCommon";
import { DSpecialEffectRef } from "ts/re/data/DEffect";
import { REBasics } from "ts/re/data/REBasics";
import { LBattlerBehavior } from "ts/re/objects/behaviors/LBattlerBehavior";
import { LExperiencedBehavior } from "ts/re/objects/behaviors/LExperiencedBehavior";
import { LEffectResult } from "ts/re/objects/LEffectResult";
import { LEntity } from "ts/re/objects/LEntity";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SLevelDownSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        target.gainActualParam(REBasics.params.level, -1, false);
        // const experience = target.findEntityBehavior(LExperiencedBehavior);
        // if (experience) {
        //     //experience.changeLevel(battler.level() - 1, true);
        // }
    }

}
