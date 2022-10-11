import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LEntity } from "ts/mr/lively/LEntity";
import { LBehaviorId, LEntityId } from "ts/mr/lively/LObject";
import { MRLively } from "ts/mr/lively/MRLively";
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
        return MRLively.world.entity(this._actorEntityId);
    }

    public inventory(): LInventoryBehavior {
        return MRLively.world.behavior(this._inventoryBehaviorId) as LInventoryBehavior;
    }

    public setSelectedEntity(entity: LEntity): void {
        this._selectedEntity = entity;
    }

    public selectedEntity(): LEntity | undefined {
        return this._selectedEntity;
    }
}
