import { LEntity } from "ts/mr/lively/LEntity";
import { LEntityId } from "ts/mr/lively/LObject";
import { MRLively } from "ts/mr/lively/MRLively";
import { SDialog } from "../SDialog";

export class SMainMenuDialog extends SDialog {
    private _entityId: LEntityId;

    constructor(entity: LEntity) {
        super();
        this._entityId = entity.entityId(); 
    }

    public entity(): LEntity {
        return MRLively.world.entity(this._entityId);
    }
}
