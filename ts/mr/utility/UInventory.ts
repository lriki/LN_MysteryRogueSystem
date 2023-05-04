import { tr2 } from "../Common";
import { LEquipmentUserBehavior } from "../lively/behaviors/LEquipmentUserBehavior";
import { LInventoryBehavior } from "../lively/behaviors/LInventoryBehavior";
import { LEntity } from "../lively/LEntity";
import { STestAddItemCommand, STestTakeItemCommand } from "../system/SCommand";
import { SCommandContext } from "../system/SCommandContext";
import { SWarehouseDialogResult } from "../system/SCommon";
import { SEffectSubject } from "../system/SEffectContext";
import { STask } from "../system/tasks/STask";
import { UName } from "./UName";

export interface SWarehouseActionResult {
    code: SWarehouseDialogResult;
    items: LEntity[];
}

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
                const sa: number = equipmentUser.isEquipped(a) ? a.kindDataId() : a.kindDataId() + 10000;
                const sb: number = equipmentUser.isEquipped(b) ? b.kindDataId() : b.kindDataId() + 10000;
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
        inventory.entities = result.map(x => x.entityId().clone());
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
    public static postStoreItemsToWarehouse(cctx: SCommandContext, user: LEntity, warehouse: LEntity, items: readonly LEntity[], outResult: SWarehouseActionResult): STask {
        const userInventory = user.getEntityBehavior(LInventoryBehavior);
        const warehouseInventory = warehouse.getEntityBehavior(LInventoryBehavior);

        return cctx.postTask(c => {
            if (warehouseInventory.itemCount + items.length > warehouseInventory.capacity) {
                cctx.postMessage(tr2("倉庫がいっぱいです。"));
                outResult.code = SWarehouseDialogResult.FullyCanceled;
                c.reject();
            }
        }).then2(c => {
            const tasks = items.map(item =>
                // item を取り出せるか確認
                cctx.postCommandTask(new STestTakeItemCommand(item, user))
                    // item を格納できるか確認
                    .thenCommandTask(new STestAddItemCommand(warehouse, item))
                    .then2(_ => {
                        // Item を移す
                        userInventory.removeEntity(item);
                        warehouseInventory.addEntity(item);
                        cctx.postMessage(tr2("%1を預けた。").format(UName.makeNameAsItem(item)));
                        this.sort(warehouseInventory);
                        outResult.items.push(item);
                    }));
            return cctx.whenAll(tasks);
        });
    }
    
    /**
     * [引き出す]
     */
    public static postWithdrawItemsToWarehouse(cctx: SCommandContext, user: LEntity, warehouse: LEntity, items: readonly LEntity[], outResult: SWarehouseActionResult): STask {
        const userInventory = user.getEntityBehavior(LInventoryBehavior);
        const warehouseInventory = warehouse.getEntityBehavior(LInventoryBehavior);
        const subject = new SEffectSubject(user);

        return cctx.postTask(c => {
            if (userInventory.itemCount + items.length > userInventory.capacity) {
                cctx.postMessage(tr2("もちものがいっぱいです。"));
                outResult.code = SWarehouseDialogResult.FullyCanceled;
                c.reject();
            }
        }).then2(_ => {
            const tasks = items.map(item =>
                // item を取り出せるか確認
                cctx.postCommandTask(new STestTakeItemCommand(item, user))
                    // item を格納できるか確認
                    .thenCommandTask(new STestAddItemCommand(user, item))
                    .then2(_ => {
                        // Item を移す
                        warehouseInventory.removeEntity(item);
                        userInventory.addEntity(item);
                        cctx.postMessage(tr2("%1を取り出した。").format(UName.makeNameAsItem(item)));
                        outResult.items.push(item);
                    }));
            return cctx.whenAll(tasks);
        });

/*
        items.forEach(item => {
            // Item を取り出せるか確認
            cctx.post(warehouse, warehouse, subject, item, testPickOutItem,
                () => {

                    // Item を格納できるか確認
                    cctx.postCommandTask(user, SCommand.make(MRBasics.commands.testPutInItem).withObject(item))
                        .then2(__filename => {
    
                            // Item を移す
                            warehouseInventory.removeEntity(item);
                            userInventory.addEntity(item);

                            cctx.postMessage(tr2("%1を取り出した。").format(UName.makeNameAsItem(item)));
                            //resultItems.push(item.entityId());
                        });
                    return true;
                });
        });
        */
    }

    /**
     * [売る] 
     */
    public static postSellItemsAndDestroy(cctx: SCommandContext, customer: LEntity, items: LEntity[]): void {
        const customerInventory = customer.getEntityBehavior(LInventoryBehavior);
        const subject = new SEffectSubject(customer);

        let testCount = 0;
        for (const item of items) {
            cctx.postCommandTask(new STestTakeItemCommand(item, customer))  // item を取り出せる？
                .then2(c => {
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
                });
        }
    }
}
