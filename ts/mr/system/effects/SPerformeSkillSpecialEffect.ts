import { assert } from "ts/mr/Common";
import { DSpecialEffectRef } from "ts/mr/data/DEffect";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/LEntity";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SPerformeSkillSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        assert(data.dataId);
        const skillId = data.dataId;
        cctx.postActivity( LActivity.makePerformSkill(target, skillId));
        result.makeSuccess();
    }

}
