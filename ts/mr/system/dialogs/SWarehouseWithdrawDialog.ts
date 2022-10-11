import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LEntity } from "ts/mr/lively/LEntity";
import { LBehaviorId, LEntityId } from "ts/mr/lively/LObject";
import { MRLively } from "ts/mr/lively/MRLively";
import { SWarehouseActionResult, UInventory } from "ts/mr/utility/UInventory";
import { MRSystem } from "../MRSystem";
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
        return MRLively.world.entity(this._userEntityId);
    }

    public get userInventory(): LInventoryBehavior {
        return MRLively.world.behavior(this._userInventoryBehaviorId) as LInventoryBehavior;
    }

    public get inventory(): LInventoryBehavior {
        return MRLively.world.behavior(this._inventoryBehaviorId) as LInventoryBehavior;
    }

    public get warehouseEntity(): LEntity {
        return MRLively.world.entity(this._warehouseEntityId);
    }

    // public setResultItems(items: LEntity[]) {
    //     this._resultItems = items.map(e => e.entityId());
    // }

    public resultItems(): LEntity[] {
        return this._resultItems.map(e => MRLively.world.entity(e));
    }

    public get result(): SWarehouseDialogResult {
        return this._result;
    }
    
    public withdrawItems(items: LEntity[]): void {
        this._resultItems = items.map(e => e.entityId());
        const r: SWarehouseActionResult = { code: SWarehouseDialogResult.Succeeded, items: [] };
        UInventory.postWithdrawItemsToWarehouse(MRSystem.commandContext, this.user, this.warehouseEntity, items, r)
            .finally(_ => {
                this._result = r.code;
                this.submit();
            });
    }
}
