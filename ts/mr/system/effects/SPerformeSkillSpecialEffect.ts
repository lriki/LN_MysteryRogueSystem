import { assert } from "ts/mr/Common";
import { DSpecificEffectId } from "ts/mr/data/DCommon";
import { DSpecialEffectRef } from "ts/mr/data/DEffect";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { LBattlerBehavior } from "ts/mr/objects/behaviors/LBattlerBehavior";
import { LEffectResult } from "ts/mr/objects/LEffectResult";
import { LEntity } from "ts/mr/objects/LEntity";
import { UAction } from "ts/mr/usecases/UAction";
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
