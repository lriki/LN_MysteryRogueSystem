import { DSpecificEffectId } from "ts/re/data/DCommon";
import { LBattlerBehavior } from "ts/re/objects/behaviors/LBattlerBehavior";
import { LEffectResult } from "ts/re/objects/LEffectResult";
import { LEntity } from "ts/re/objects/LEntity";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SLevelDownSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, id: DSpecificEffectId, performer: LEntity, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        const battler = target.findEntityBehavior(LBattlerBehavior);
        if (battler) {
            battler.changeLevel(battler.level() - 1, true);
        }
    }

}
