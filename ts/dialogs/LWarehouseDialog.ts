import { REGame } from "ts/objects/REGame";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { EntityId } from "ts/system/EntityId";
import { REDialog, REDialogContext } from "../system/REDialog";

export class LWarehouseDialog extends REDialog {
    private _userEntityId: EntityId;
    private _warehouseEntityId: EntityId;

    public constructor(userEntityId: EntityId, warehouseEntityId: EntityId) {
        super();
        this._userEntityId = userEntityId;
        this._warehouseEntityId = warehouseEntityId;
    }

    public userEntity(): REGame_Entity {
        return REGame.world.entity(this._userEntityId);
    }

    public warehouseEntity(): REGame_Entity {
        return REGame.world.entity(this._warehouseEntityId);
    }
}
