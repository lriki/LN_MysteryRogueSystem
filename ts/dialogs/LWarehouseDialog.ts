import { tr } from "ts/Common";
import { testPickOutItem, testPutInItem } from "ts/objects/behaviors/LBehavior";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { LEntityId } from "ts/objects/LObject";
import { REGame } from "ts/objects/REGame";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
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

    public userEntity(): REGame_Entity {
        return REGame.world.entity(this._userEntityId);
    }

    public warehouseEntity(): REGame_Entity {
        return REGame.world.entity(this._warehouseEntityId);
    }

    public storeItems(items: REGame_Entity[]): void {
        const user = this.userEntity();
        const warehouse = this.warehouseEntity();
        const userInventory = user.getBehavior(LInventoryBehavior);
        const warehouseInventory = warehouse.getBehavior(LInventoryBehavior);

        console.log("!!!!!  storeItems", items);

        items.forEach(item => {
            console.log("0");
            // Item を取り出せるか確認
            RESystem.commandContext.post(user, user, item, testPickOutItem,
                (response: REResponse, reactor: REGame_Entity, context: RECommandContext) => {
                    console.log("1");
                    if (response == REResponse.Succeeded) {
                        console.log("2");

                        // Item を格納できるか確認
                        RESystem.commandContext.post(warehouse, warehouse, item, testPutInItem,
                            (response: REResponse, reactor: REGame_Entity, context: RECommandContext) => {
                                console.log("3");
                                if (response == REResponse.Succeeded) {
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

        RESystem.dialogContext.closeDialog(true);
    }
    
}
