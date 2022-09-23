import { LEntity } from "ts/mr/lively/LEntity";
import { LEntityId } from "ts/mr/lively/LObject";
import { REGame } from "ts/mr/lively/REGame";
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
