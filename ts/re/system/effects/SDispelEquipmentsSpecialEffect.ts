import { DSpecificEffectId } from "ts/re/data/DCommon";
import { DSpecialEffectRef } from "ts/re/data/DEffect";
import { MRData } from "ts/re/data/MRData";
import { LBattlerBehavior } from "ts/re/objects/behaviors/LBattlerBehavior";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { LEffectResult } from "ts/re/objects/LEffectResult";
import { LEntity } from "ts/re/objects/LEntity";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

/**
 * @deprecated
 */
export class SDispelEquipmentsSpecialEffect extends SSpecialEffect {
    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        const equipmentUser = target.findEntityBehavior(LEquipmentUserBehavior);
        if (equipmentUser) {
            const items = equipmentUser.equippedItemEntities();
            if (this.testApply(items)) {
                for (const item of items) {
                    if (item.isStateAffected(MRData.system.states.curse)) {
                        item.removeState(MRData.system.states.curse);
                        result.makeSuccess();
                        item._effectResult._revision++;
                    }
                }
            }
            else {
                // No effect.
            }
        }
    }

    public testApply(items: LEntity[]): boolean {
        return !!items.find(x => x.isStateAffected(MRData.system.states.curse));
    }
}
