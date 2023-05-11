import { DSpecialEffectRef } from "ts/mr/data/DSpecialEffect";
import { MRData } from "ts/mr/data/MRData";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { SCommandContext } from "../../SCommandContext";
import { SEffect } from "../../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

/**
 * @deprecated
 */
export class SDispelEquipmentsSpecialEffect extends SSpecialEffect {
    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffect, target: LEntity, result: LEffectResult): void {
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
