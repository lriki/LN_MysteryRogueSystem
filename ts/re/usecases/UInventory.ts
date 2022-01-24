import { tr2 } from "../Common";
import { testPickOutItem, testPutInItem } from "../objects/behaviors/LBehavior";
import { LEquipmentUserBehavior } from "../objects/behaviors/LEquipmentUserBehavior";
import { LInventoryBehavior } from "../objects/behaviors/LInventoryBehavior";
import { LEntity } from "../objects/LEntity";
import { SCommandContext } from "../system/SCommandContext";
import { SEffectSubject } from "../system/SEffectContext";
import { UName } from "./UName";

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

    /**
     * [預ける]
     */
    public static postStoreItemsToWarehouse(cctx: SCommandContext, user: LEntity, warehouse: LEntity, items: LEntity[]): void {
        const userInventory = user.getEntityBehavior(LInventoryBehavior);
        const warehouseInventory = warehouse.getEntityBehavior(LInventoryBehavior);
        const subject = new SEffectSubject(user);

        console.log("!!!!!  storeItems", items);

        items.forEach(item => {
            console.log("0");
            // Item を取り出せるか確認
            cctx.post(user, user, subject, item, testPickOutItem,
                () => {
                    console.log("2");

                    // Item を格納できるか確認
                    cctx.post(warehouse, warehouse, subject, item, testPutInItem,
                        () => {
                            console.log("4");
    
                            // Item を移す
                            userInventory.removeEntity(item);
                            warehouseInventory.addEntity(item);

                            cctx.postMessage(tr2("%1を預けた。").format(UName.makeNameAsItem(item)));
                            return true;
                        });
                    return true;
                });
        });
    }
}
