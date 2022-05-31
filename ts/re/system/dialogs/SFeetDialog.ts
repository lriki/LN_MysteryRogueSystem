import { DActionId } from "ts/re/data/DAction";
import { LEntity } from "ts/re/objects/LEntity";
import { LEntityId } from "ts/re/objects/LObject";
import { REGame } from "ts/re/objects/REGame";
import { SDialog } from "../SDialog";

export class LFeetDialog extends SDialog {
    private _targetEntityId: LEntityId;
    private _reactions: DActionId[];

    constructor(targetEntity: LEntity) {
        super();
        this._targetEntityId = targetEntity.entityId();
        this._reactions = targetEntity.queryReactions();
    }

    public targetEntity(): LEntity {
        return REGame.world.entity(this._targetEntityId);
    }

    public reactions(): DActionId[] {
        return this._reactions;
    }
}
