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
                    return a.dataId - b.dataId;
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
        const entities = inventory.items;
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

        if (warehouseInventory.itemCount + items.length > warehouseInventory.capacity) {
            cctx.postMessage(tr2("倉庫がいっぱいです。"));
            return;
        }
        

        items.forEach(item => {
            // Item を取り出せるか確認
            cctx.post(user, user, subject, item, testPickOutItem,
                () => {

                    // Item を格納できるか確認
                    cctx.post(warehouse, warehouse, subject, item, testPutInItem,
                        () => {
    
                            // Item を移す
                            userInventory.removeEntity(item);
                            warehouseInventory.addEntity(item);

                            cctx.postMessage(tr2("%1を預けた。").format(UName.makeNameAsItem(item)));
                            this.sort(warehouseInventory);
                            return true;
                        });
                    return true;
                });
        });
    }
    
    /**
     * [引き出す]
     */
    public static postWithdrawItemsToWarehouse(cctx: SCommandContext, user: LEntity, warehouse: LEntity, items: LEntity[]): void {
        const userInventory = user.getEntityBehavior(LInventoryBehavior);
        const warehouseInventory = warehouse.getEntityBehavior(LInventoryBehavior);
        const subject = new SEffectSubject(user);

        if (userInventory.itemCount + items.length > userInventory.capacity) {
            cctx.postMessage(tr2("もちものがいっぱいです。"));
            return;
        }

        items.forEach(item => {
            // Item を取り出せるか確認
            cctx.post(warehouse, warehouse, subject, item, testPickOutItem,
                () => {

                    // Item を格納できるか確認
                    cctx.post(user, user, subject, item, testPutInItem,
                        () => {
    
                            // Item を移す
                            warehouseInventory.removeEntity(item);
                            userInventory.addEntity(item);

                            cctx.postMessage(tr2("%1を取り出した。").format(UName.makeNameAsItem(item)));
                            return true;
                        });
                    return true;
                });
        });
    }

    /**
     * [売る] 
     */
    public static postSellItemsAndDestroy(cctx: SCommandContext, customer: LEntity, items: LEntity[]): void {
        const customerInventory = customer.getEntityBehavior(LInventoryBehavior);
        const subject = new SEffectSubject(customer);

        let testCount = 0;
        for (const item of items) {
            cctx.post(customer, customer, subject, item, testPickOutItem, () => {   // Item を取り出せるか確認
                testCount++;
                if (testCount >= items.length) {
                    // 全部確認完了
                    let price = 0;
                    for (const item of items) {
                        price += item.data.purchasePrice;
                        item.removeFromParent();
                        item.destroy();
                    }
                    customerInventory.gainGold(price);
                }
                return true;
            });
        }
    }
}
