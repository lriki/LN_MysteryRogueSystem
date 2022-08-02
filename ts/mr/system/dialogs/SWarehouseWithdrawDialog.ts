import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/mr/objects/LEntity";
import { LBehaviorId, LEntityId } from "ts/mr/objects/LObject";
import { REGame } from "ts/mr/objects/REGame";
import { SWarehouseActionResult, UInventory } from "ts/mr/usecases/UInventory";
import { RESystem } from "../RESystem";
import { SWarehouseDialogResult } from "../SCommon";
import { SDialog } from "../SDialog";

export class SWarehouseWithdrawDialog extends SDialog {
    private _userEntityId: LEntityId;
    private _userInventoryBehaviorId: LBehaviorId;
    private _warehouseEntityId: LEntityId;
    private _inventoryBehaviorId: LBehaviorId;
    private _resultItems: LEntityId[];
    private _result: SWarehouseDialogResult;

    public constructor(user: LEntity, warehouse: LEntity) {
        super();
        this._userEntityId = user.entityId();
        this._userInventoryBehaviorId = user.getEntityBehavior(LInventoryBehavior).id();
        this._warehouseEntityId = warehouse.entityId();
        this._inventoryBehaviorId = warehouse.getEntityBehavior(LInventoryBehavior).id();
        this._resultItems = [];
        this._result = SWarehouseDialogResult.Cancel;
    }

    public get user(): LEntity {
        return REGame.world.entity(this._userEntityId);
    }

    public get userInventory(): LInventoryBehavior {
        return REGame.world.behavior(this._userInventoryBehaviorId) as LInventoryBehavior;
    }

    public get inventory(): LInventoryBehavior {
        return REGame.world.behavior(this._inventoryBehaviorId) as LInventoryBehavior;
    }

    public get warehouseEntity(): LEntity {
        return REGame.world.entity(this._warehouseEntityId);
    }

    // public setResultItems(items: LEntity[]) {
    //     this._resultItems = items.map(e => e.entityId());
    // }

    public resultItems(): LEntity[] {
        return this._resultItems.map(e => REGame.world.entity(e));
    }

    public get result(): SWarehouseDialogResult {
        return this._result;
    }
    
    public withdrawItems(items: LEntity[]): void {
        this._resultItems = items.map(e => e.entityId());
        const r: SWarehouseActionResult = { code: SWarehouseDialogResult.Succeeded, items: [] };
        UInventory.postWithdrawItemsToWarehouse(RESystem.commandContext, this.user, this.warehouseEntity, items, r)
            .finally(_ => {
                this._result = r.code;
                this.submit();
            });
    }
}
