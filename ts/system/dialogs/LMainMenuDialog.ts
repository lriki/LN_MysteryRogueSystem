import { LEntity } from "ts/objects/LEntity";
import { LEntityId } from "ts/objects/LObject";
import { REGame } from "ts/objects/REGame";
import { SDialog } from "../SDialog";

export class LMainMenuDialog extends SDialog {
    private _entityId: LEntityId;

    constructor(entity: LEntity) {
        super();
        this._entityId = entity.entityId(); 
    }

    public entity(): LEntity {
        return REGame.world.entity(this._entityId);
    }
}
