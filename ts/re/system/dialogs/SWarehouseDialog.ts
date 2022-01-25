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
import { UInventory } from "ts/re/usecases/UInventory";

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
        UInventory.postStoreItemsToWarehouse(RESystem.commandContext, this.userEntity(), this.warehouseEntity(), items);
        this.submit();
    }
    
    public withdrawItems(items: LEntity[]): void {
        UInventory.postWithdrawItemsToWarehouse(RESystem.commandContext, this.userEntity(), this.warehouseEntity(), items);
        this.submit();
    }
}
