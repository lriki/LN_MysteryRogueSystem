import { DActionId } from "ts/data/DAction";
import { LEntity } from "ts/objects/LEntity";
import { LEntityId } from "ts/objects/LObject";
import { REGame } from "ts/objects/REGame";
import { SDialog } from "../SDialog";

export class LFeetDialog extends SDialog {
    private _targetEntityId: LEntityId;
    private _actions: DActionId[];

    constructor(targetEntity: LEntity) {
        super();
        this._targetEntityId = targetEntity.entityId();
        this._actions = targetEntity.queryReactions();

        console.log("LFeetDialog", targetEntity, this._actions);
    }

    public targetEntity(): LEntity {
        return REGame.world.entity(this._targetEntityId);
    }

    public actions(): DActionId[] {
        return this._actions;
    }
}
