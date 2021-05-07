import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/objects/LEntity";
import { LBehaviorId, LEntityId } from "ts/objects/LObject";
import { REGame } from "ts/objects/REGame";
import { REDialog } from "../system/REDialog";

export class LItemListDialog extends REDialog {
    private _actorEntityId: LEntityId;
    private _inventoryBehaviorId: LBehaviorId;

    public constructor(actorEntity: LEntity, inventory: LInventoryBehavior) {
        super();
        this._actorEntityId = actorEntity.entityId();
        this._inventoryBehaviorId = inventory.id();
    }

    public entity(): LEntity {
        return REGame.world.entity(this._actorEntityId);
    }

    public inventory(): LInventoryBehavior {
        return REGame.world.behavior(this._inventoryBehaviorId) as LInventoryBehavior;
    }

}
