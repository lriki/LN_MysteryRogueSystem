import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { LBehaviorId, LEntityId } from "ts/re/objects/LObject";
import { REGame } from "ts/re/objects/REGame";
import { UInventory } from "ts/re/usecases/UInventory";
import { RESystem } from "../RESystem";
import { SDialog } from "../SDialog";

export class SWarehouseWithdrawDialog extends SDialog {
    private _userEntityId: LEntityId;
    private _inventoryBehaviorId: LBehaviorId;
    private _warehouseEntityId: LEntityId;
    private _resultItems: LEntityId[];

    public constructor(user: LEntity, warehouse: LEntity) {
        super();
        this._userEntityId = user.entityId();
        this._inventoryBehaviorId = warehouse.getEntityBehavior(LInventoryBehavior).id();
        this._warehouseEntityId = warehouse.entityId();
        this._resultItems = [];
    }

    public get user(): LEntity {
        return REGame.world.entity(this._userEntityId);
    }

    public get inventory(): LInventoryBehavior {
        return REGame.world.behavior(this._inventoryBehaviorId) as LInventoryBehavior;
    }

    public get warehouseEntity(): LEntity {
        return REGame.world.entity(this._warehouseEntityId);
    }

    public setResultItems(items: LEntity[]) {
        this._resultItems = items.map(e => e.entityId());
    }

    public resultItems(): LEntity[] {
        return this._resultItems.map(e => REGame.world.entity(e));
    }
    
    public withdrawItems(items: LEntity[]): void {
        UInventory.postWithdrawItemsToWarehouse(RESystem.commandContext, this.user, this.warehouseEntity, items);
        this.submit();
    }
}
