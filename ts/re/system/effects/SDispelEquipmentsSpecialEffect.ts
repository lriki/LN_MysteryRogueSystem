import { DSpecificEffectId } from "ts/re/data/DCommon";
import { REData } from "ts/re/data/REData";
import { LBattlerBehavior } from "ts/re/objects/behaviors/LBattlerBehavior";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { LEffectResult } from "ts/re/objects/LEffectResult";
import { LEntity } from "ts/re/objects/LEntity";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SDispelEquipmentsSpecialEffect extends SSpecialEffect {
    public onApplyTargetEffect(cctx: SCommandContext, id: DSpecificEffectId, performer: LEntity, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        const equipmentUser = target.findEntityBehavior(LEquipmentUserBehavior);
        if (equipmentUser) {
            const items = equipmentUser.equippedItemEntities();
            if (this.testApply(items)) {
                for (const item of items) {
                    if (item.isStateAffected(REData.system.states.curse)) {
                        item.removeState(REData.system.states.curse);
                    }
                }
            }
            else {
                // No effect.
            }
        }
    }

    public testApply(items: LEntity[]): boolean {
        return !!items.find(x => x.isStateAffected(REData.system.states.curse));
    }
}
