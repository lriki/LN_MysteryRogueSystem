import { tr } from "ts/Common";
import { testPickOutItem, testPutInItem } from "ts/objects/behaviors/LBehavior";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { LEntityId } from "ts/objects/LObject";
import { REGame } from "ts/objects/REGame";
import { LEntity } from "ts/objects/LEntity";
import { REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { RESystem } from "ts/system/RESystem";
import { REDialog, REDialogContext } from "../system/REDialog";

export class LWarehouseDialog extends REDialog {
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
        const userInventory = user.getBehavior(LInventoryBehavior);
        const warehouseInventory = warehouse.getBehavior(LInventoryBehavior);

        console.log("!!!!!  storeItems", items);

        items.forEach(item => {
            console.log("0");
            // Item を取り出せるか確認
            RESystem.commandContext.post(user, user, item, testPickOutItem,
                (response: REResponse, reactor: LEntity, context: SCommandContext) => {
                    console.log("1");
                    if (response != REResponse.Canceled) {
                        console.log("2");

                        // Item を格納できるか確認
                        RESystem.commandContext.post(warehouse, warehouse, item, testPutInItem,
                            (response: REResponse, reactor: LEntity, context: SCommandContext) => {
                                console.log("3");
                                if (response != REResponse.Canceled) {
                                    console.log("4");
            
                                    // Item を移す
                                    userInventory.removeEntity(item);
                                    warehouseInventory.addEntity(item);

                                    context.postMessage(tr("{0} を預けた。", REGame.identifyer.makeDisplayText(item)));
                                }
                            });
                    }
                });
        })

        this.close(true);
    }
    
    public withdrawItems(items: LEntity[]): void {
        const user = this.userEntity();
        const warehouse = this.warehouseEntity();
        const userInventory = user.getBehavior(LInventoryBehavior);
        const warehouseInventory = warehouse.getBehavior(LInventoryBehavior);

        items.forEach(item => {
            console.log("0");
            // Item を取り出せるか確認
            RESystem.commandContext.post(warehouse, warehouse, item, testPickOutItem,
                (response: REResponse, reactor: LEntity, context: SCommandContext) => {
                    console.log("1");
                    if (response != REResponse.Canceled) {
                        console.log("2");

                        // Item を格納できるか確認
                        RESystem.commandContext.post(user, user, item, testPutInItem,
                            (response: REResponse, reactor: LEntity, context: SCommandContext) => {
                                console.log("3");
                                if (response != REResponse.Canceled) {
                                    console.log("4");
            
                                    // Item を移す
                                    warehouseInventory.removeEntity(item);
                                    userInventory.addEntity(item);

                                    context.postMessage(tr("{0} を取り出した。", REGame.identifyer.makeDisplayText(item)));
                                }
                            });
                    }
                });
        })

        this.close(true);
    }
}
