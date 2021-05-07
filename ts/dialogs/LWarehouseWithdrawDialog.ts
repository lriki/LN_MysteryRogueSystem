import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/objects/LEntity";
import { LBehaviorId, LEntityId } from "ts/objects/LObject";
import { REGame } from "ts/objects/REGame";
import { REGameManager } from "ts/system/REGameManager";
import { REDialog } from "../system/REDialog";

export class LWarehouseWithdrawDialog extends REDialog {
    private _actorEntityId: LEntityId;
    private _inventoryBehaviorId: LBehaviorId;
    private _resultItems: LEntityId[];

    public constructor(actorEntity: LEntity, inventory: LInventoryBehavior) {
        super();
        this._actorEntityId = actorEntity.entityId();
        this._inventoryBehaviorId = inventory.id();
        this._resultItems = [];
    }

    public entity(): LEntity {
        return REGame.world.entity(this._actorEntityId);
    }

    public inventory(): LInventoryBehavior {
        return REGame.world.behavior(this._inventoryBehaviorId) as LInventoryBehavior;
    }

    public setResultItems(items: LEntity[]) {
        this._resultItems = items.map(e => e.entityId());
    }

    public resultItems(): LEntity[] {
        return this._resultItems.map(e => REGame.world.entity(e));
    }
}
