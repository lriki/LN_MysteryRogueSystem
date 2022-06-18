import { LEntity } from "ts/mr/objects/LEntity";
import { LEntityId } from "ts/mr/objects/LObject";
import { REGame } from "ts/mr/objects/REGame";
import { SDialog } from "../SDialog";

export class SMainMenuDialog extends SDialog {
    private _entityId: LEntityId;

    constructor(entity: LEntity) {
        super();
        this._entityId = entity.entityId(); 
    }

    public entity(): LEntity {
        return REGame.world.entity(this._entityId);
    }
}
