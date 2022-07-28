import { tr } from "ts/mr/Common";
import { testPickOutItem, testPutInItem } from "ts/mr/objects/behaviors/LBehavior";
import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { LEntityId } from "ts/mr/objects/LObject";
import { REGame } from "ts/mr/objects/REGame";
import { LEntity } from "ts/mr/objects/LEntity";
import { RESystem } from "ts/mr/system/RESystem";
import { SDialog } from "../SDialog";
import { SEffectSubject } from "ts/mr/system/SEffectContext";
import { UName } from "ts/mr/usecases/UName";
import { UInventory } from "ts/mr/usecases/UInventory";

// export class SWarehouseDialog extends SDialog {
//     private _userEntityId: LEntityId;
//     private _warehouseEntityId: LEntityId;

//     public constructor(userEntityId: LEntityId, warehouseEntityId: LEntityId) {
//         super();
//         this._userEntityId = userEntityId;
//         this._warehouseEntityId = warehouseEntityId;
//     }

//     public userEntity(): LEntity {
//         return REGame.world.entity(this._userEntityId);
//     }

//     public warehouseEntity(): LEntity {
//         return REGame.world.entity(this._warehouseEntityId);
//     }

//     // public storeItems(items: LEntity[]): void {
//     //     UInventory.postStoreItemsToWarehouse(RESystem.commandContext, this.userEntity(), this.warehouseEntity(), items);
//     //     this.submit();
//     // }
    
//     // public withdrawItems(items: LEntity[]): void {
//     //     UInventory.postWithdrawItemsToWarehouse(RESystem.commandContext, this.userEntity(), this.warehouseEntity(), items);
//     //     this.submit();
//     // }
// }
