import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/mr/objects/LEntity";
import { LBehaviorId, LEntityId } from "ts/mr/objects/LObject";
import { REGame } from "ts/mr/objects/REGame";
import { SDialog } from "../SDialog";

export class SItemSelectionDialog extends SDialog {
    private _actorEntityId: LEntityId;
    private _inventoryBehaviorId: LBehaviorId;
    private _selectedEntity: LEntity | undefined;

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

    public setSelectedEntity(entity: LEntity): void {
        this._selectedEntity = entity;
    }

    public selectedEntity(): LEntity | undefined {
        return this._selectedEntity;
    }
}