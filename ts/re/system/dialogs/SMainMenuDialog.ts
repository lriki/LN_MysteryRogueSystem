import { LEntity } from "ts/re/objects/LEntity";
import { LEntityId } from "ts/re/objects/LObject";
import { REGame } from "ts/re/objects/REGame";
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
