import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/mr/objects/LEntity";
import { LBehaviorId, LEntityId } from "ts/mr/objects/LObject";
import { REGame } from "ts/mr/objects/REGame";
import { UInventory } from "ts/mr/usecases/UInventory";
import { RESystem } from "../RESystem";
import { SDialog } from "../SDialog";
import { SDialogContext } from "../SDialogContext";

export class SWarehouseStoreDialog extends SDialog {
    private _userEntityId: LEntityId;
    private _inventoryBehaviorId: LBehaviorId;
    private _warehouseEntityId: LEntityId;
    private _warehouseInventoryBehaviorId: LBehaviorId;
    private _resultItems: LEntityId[];
    // private _closeRequested: boolean = false;

    public constructor(user: LEntity, warehouse: LEntity) {
        super();
        this._userEntityId = user.entityId();
        this._inventoryBehaviorId = user.getEntityBehavior(LInventoryBehavior).id();
        this._warehouseEntityId = warehouse.entityId();
        this._warehouseInventoryBehaviorId = warehouse.getEntityBehavior(LInventoryBehavior).id();
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

    public get warehouseInventory(): LInventoryBehavior {
        return REGame.world.behavior(this._warehouseInventoryBehaviorId) as LInventoryBehavior;
    }

    public resultItems(): LEntity[] {
        return this._resultItems.map(e => REGame.world.entity(e));
    }
    
    public storeItems(items: LEntity[]): void {
        this._resultItems = items.map(e => e.entityId());
        UInventory.postStoreItemsToWarehouse(RESystem.commandContext, this.user, this.warehouseEntity, items, this._resultItems);
        this.submit();
        // this._closeRequested = true;
    }
    
    // onUpdate(context: SDialogContext): void {
    //     console.log("SWarehouseStoreDialog.onUpdate", this._closeRequested);
    //     if (this._closeRequested) {
    //         this.submit();
    //     }
    // }
}
