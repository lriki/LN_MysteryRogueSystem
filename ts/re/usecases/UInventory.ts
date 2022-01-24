import { LEquipmentUserBehavior } from "../objects/behaviors/LEquipmentUserBehavior";
import { LInventoryBehavior } from "../objects/behaviors/LInventoryBehavior";
import { LEntity } from "../objects/LEntity";

export class UInventory {
    /**
     * Inventory のソート。
     * 
     * NOTE: LEquipmentUserBehavior を使いたいが、LInventoryBehavior に実装してしまうと import の循環参照が発生するためこちらで実装する。
     */
    public static sort(inventory: LInventoryBehavior): void {
        const equipmentUser = inventory.ownerEntity().findEntityBehavior(LEquipmentUserBehavior);


        const entities = this.makeMergedStackables(inventory);


        let result;
        if (equipmentUser) {
            result = entities.sort((a, b) => {
                const sa = equipmentUser.isEquipped(a) ? a.kindDataId() : a.kindDataId() + 10000;
                const sb = equipmentUser.isEquipped(b) ? b.kindDataId() : b.kindDataId() + 10000;
                if (sa == sb) {
                    // DataId も確認
                    return a.dataId() - b.dataId();
                }
                else {
                    return sa - sb;
                }
            });
        }
        else {
            result = entities.sort((a, b) => {
                const sa = a.kindDataId();
                const sb = b.kindDataId();
                return sa - sb;
            });
        }
        inventory._entities = result.map(x => x.entityId().clone());
    }

    public static makeMergedStackables(inventory: LInventoryBehavior): LEntity[] {
        const entities = inventory.entities();
        for (let i = entities.length - 1; i >= 0; i--) {    // 後ろからループ
            for (let j = i - 1; j >= 0; j--) {              // i のひとつ前から前方へ確認
                const src = entities[i];
                const dst = entities[j];
                if (dst.checkStackable(src)) {
                    dst.increaseStack(src);
                    entities.mutableRemoveAt(i);
                    break;
                }
                
            }
        }
        return entities;
    }
}
