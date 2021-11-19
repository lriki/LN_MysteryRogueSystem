import { DSpecificEffectId } from "ts/re/data/DCommon";
import { LBattlerBehavior } from "ts/re/objects/behaviors/LBattlerBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { UAction } from "ts/re/usecases/UAction";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SWarpSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, id: DSpecificEffectId, performer: LEntity, modifier: SEffectModifier, target: LEntity): void {
        UAction.postWarp(cctx, target);
    }

}
