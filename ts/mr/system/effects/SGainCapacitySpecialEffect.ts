import { DSpecialEffectRef } from "ts/mr/data/DSpecialEffect";
import { SCommandContext } from "../SCommandContext";
import { SSpecialEffect } from "./SSpecialEffect";
import { LEntity } from "ts/mr/lively/LEntity";
import { SEffect } from "../SEffectApplyer";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { assert, tr2 } from "ts/mr/Common";
import { UName } from "ts/mr/utility/UName";
import { paramDestroyOverflowingItems } from "ts/mr/PluginParameters";
import { TDrop } from "ts/mr/transactions/TDrop";

export class SGainCapacitySpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffect, target: LEntity, result: LEffectResult): void {
        const inventory = target.findEntityBehavior(LInventoryBehavior);
        if (inventory && inventory.isStorage) {
            
            const oldCapacity = inventory.capacity;
            const newCapacity = oldCapacity + data.value;

            const location = target.getLocation();
            assert(location);   // not implemented.

            
            // あふれる分は削除する
            if (newCapacity < inventory.capacity) {
                const items = inventory.items;
                const removeItems = [];
                for (let i = items.length - 1; i >= newCapacity; i--) {
                    removeItems.push(items[i]);
                }
                for (const item of removeItems) {
                    if (paramDestroyOverflowingItems) {
                        item.removeFromParent();
                        item.destroy();
                    }
                    else {
                        TDrop.dropOrDestroyEntityForce(cctx, item, location.mx, location.my);
                    }
                }
            }
            
            inventory.resetCapacity(newCapacity);

            if (result) {
                if (inventory.capacity < oldCapacity) {
                    cctx.postMessage(tr2("%1の容量が減った。").format(UName.makeNameAsItem(target)));
                    result.makeSuccess();
                }
                else if (inventory.capacity > oldCapacity) {
                    cctx.postMessage(tr2("%1の容量が増えた！").format(UName.makeNameAsItem(target)));
                    result.makeSuccess();
                }
            }
        }
    }
}
