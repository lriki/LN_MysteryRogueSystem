import { tr } from "ts/re/Common";
import { testPickOutItem, testPutInItem } from "ts/re/objects/behaviors/LBehavior";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEntityId } from "ts/re/objects/LObject";
import { REGame } from "ts/re/objects/REGame";
import { LEntity } from "ts/re/objects/LEntity";
import { RESystem } from "ts/re/system/RESystem";
import { SDialog } from "../SDialog";
import { SEffectSubject } from "ts/re/system/SEffectContext";
import { UName } from "ts/re/usecases/UName";

export class SWarehouseDialog extends SDialog {
    private _userEntityId: LEntityId;
    private _warehouseEntityId: LEntityId;

    public constructor(userEntityId: LEntityId, warehouseEntityId: LEntityId) {
        super();
        this._userEntityId = userEntityId;
        this._warehouseEntityId = warehouseEntityId;
    }

    public userEntity(): LEntity {
        return REGame.world.entity(this._userEntityId);
    }

    public warehouseEntity(): LEntity {
        return REGame.world.entity(this._warehouseEntityId);
    }

    public storeItems(items: LEntity[]): void {
        const user = this.userEntity();
        const warehouse = this.warehouseEntity();
        const userInventory = user.getEntityBehavior(LInventoryBehavior);
        const warehouseInventory = warehouse.getEntityBehavior(LInventoryBehavior);
        const subject = new SEffectSubject(user);

        console.log("!!!!!  storeItems", items);
        const context = RESystem.commandContext;

        items.forEach(item => {
            console.log("0");
            // Item を取り出せるか確認
            context.post(user, user, subject, item, testPickOutItem,
                () => {
                    console.log("2");

                    // Item を格納できるか確認
                    context.post(warehouse, warehouse, subject, item, testPutInItem,
                        () => {
                            console.log("4");
    
                            // Item を移す
                            userInventory.removeEntity(item);
                            warehouseInventory.addEntity(item);

                            context.postMessage(tr("{0} を預けた。", UName.makeNameAsItem(item)));
                            return true;
                        });
                    return true;
                });
        })

        this.submit();
    }
    
    public withdrawItems(items: LEntity[]): void {
        const user = this.userEntity();
        const warehouse = this.warehouseEntity();
        const userInventory = user.getEntityBehavior(LInventoryBehavior);
        const warehouseInventory = warehouse.getEntityBehavior(LInventoryBehavior);
        const subject = new SEffectSubject(user);
        const context = RESystem.commandContext;

        items.forEach(item => {
            console.log("0");
            // Item を取り出せるか確認
            context.post(warehouse, warehouse, subject, item, testPickOutItem,
                () => {
                    console.log("2");

                    // Item を格納できるか確認
                    context.post(user, user, subject, item, testPutInItem,
                        () => {
                            console.log("4");
    
                            // Item を移す
                            warehouseInventory.removeEntity(item);
                            userInventory.addEntity(item);

                            context.postMessage(tr("{0} を取り出した。", UName.makeNameAsItem(item)));
                            return true;
                        });
                    return true;
                });
        })

        this.submit();
    }
}
