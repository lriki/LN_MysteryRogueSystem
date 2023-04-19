import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LEntity } from "ts/mr/lively/LEntity";
import { LBehaviorId, LEntityId } from "ts/mr/lively/LObject";
import { MRLively } from "ts/mr/lively/MRLively";
import { SDialog } from "../SDialog";
import { SInventoryDialogBase } from "./SInventoryDialogBase";

export class SItemSelectionDialog extends SInventoryDialogBase {
    private readonly _actorEntityId: LEntityId;
    private readonly _canMultiSelect: boolean;

    public constructor(actorEntity: LEntity, inventory: LInventoryBehavior, canMultiSelect: boolean) {
        super(inventory);
        this._actorEntityId = actorEntity.entityId();
        this._canMultiSelect = canMultiSelect;
    }

    public canMultiSelect(): boolean {
        return this._canMultiSelect;
    }
    // public get isMultiSelectMode(): boolean {
    //     return this._multiSelectMode;
    // }

    public entity(): LEntity {
        return MRLively.world.entity(this._actorEntityId);
    }
}
