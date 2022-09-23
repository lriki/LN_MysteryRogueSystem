import { DSpecificEffectId } from "ts/mr/data/DCommon";
import { DSpecialEffectRef } from "ts/mr/data/DEffect";
import { MRData } from "ts/mr/data/MRData";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/LEntity";
import { REGame } from "ts/mr/lively/REGame";
import { USpawner } from "ts/mr/usecases/USpawner";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SChangeInstanceSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        const entityData = (() => {
            if (data.entityId)
                return MRData.entities[data.entityId];
            else
                return cctx.random().select(USpawner.getEnemiesFromSpawnTable(target.floorId));
        })();

        const prevIsUnit = target.isUnit();

        target.setupInstance(entityData.id);

        // TODO: リリース前暫定対応。
        // ここで直接 Behavior を参照してるのであまりよくない。
        // Instance が変わったことをしめす Event を実装したほうがいいだろう。
        // かつ、その Event はグローバルなイベントではなく、特定の Entity の状態変化を "監視" 出来るような仕組みにしたい。
        {
            const inventory = target.parentAs(LInventoryBehavior);
            if (inventory) {
                const owner = inventory.ownerEntity();
                const equipmentUser = owner.findEntityBehavior(LEquipmentUserBehavior);
                if (equipmentUser) {
                    if (equipmentUser.isShortcutEquipped(target)) {
                        equipmentUser.removeShortcut(target);
                    }
                    else {
                        equipmentUser.removeEquitment(target);
                    }
                }
            }
        }

        result.makeSuccess();

        if (prevIsUnit) {
            REGame.scheduler.resetEntity(target);
        }
    }

}
