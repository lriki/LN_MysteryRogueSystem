import { LEntity } from "ts/objects/LEntity";
import { SDialog } from "../SDialog";

export class SDetailsDialog extends SDialog {
    private _entity: LEntity;

    public constructor(entity: LEntity) {
        super();
        this._entity = entity;
    }

    public entity(): LEntity {
        return this._entity;
    }
}
