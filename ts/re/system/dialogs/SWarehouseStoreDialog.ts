import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { LBehaviorId, LEntityId } from "ts/re/objects/LObject";
import { REGame } from "ts/re/objects/REGame";
import { UInventory } from "ts/re/usecases/UInventory";
import { RESystem } from "../RESystem";
import { SDialog } from "../SDialog";

export class SWarehouseStoreDialog extends SDialog {
    private _actorEntityId: LEntityId;
    private _inventoryBehaviorId: LBehaviorId;
    private _warehouseEntityId: LEntityId;
    private _warehouseInventoryBehaviorId: LBehaviorId;
    private _resultItems: LEntityId[];

    public constructor(actorEntity: LEntity, warehouse: LEntity) {
        super();
        this._actorEntityId = actorEntity.entityId();
        this._inventoryBehaviorId = actorEntity.getEntityBehavior(LInventoryBehavior).id();
        this._warehouseEntityId = warehouse.entityId();
        this._warehouseInventoryBehaviorId = warehouse.getEntityBehavior(LInventoryBehavior).id();
        this._resultItems = [];
    }

    public entity(): LEntity {
        return REGame.world.entity(this._actorEntityId);
    }

    public inventory(): LInventoryBehavior {
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
    
    public storeItems(items: LEntity[]): void {
        UInventory.postStoreItemsToWarehouse(RESystem.commandContext, this.entity(), this.warehouseEntity, items);
        this.submit();
    }
}
