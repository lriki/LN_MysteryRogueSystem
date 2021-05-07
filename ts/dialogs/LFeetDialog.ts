import { DActionId } from "ts/data/DAction";
import { LEntity } from "ts/objects/LEntity";
import { LEntityId } from "ts/objects/LObject";
import { REGame } from "ts/objects/REGame";
import { REDialog } from "../system/REDialog";

export class LFeetDialog extends REDialog {
    private _targetEntityId: LEntityId;
    private _actions: DActionId[];

    constructor(targetEntity: LEntity, actions: DActionId[]) {
        super();
        this._targetEntityId = targetEntity.entityId();
        this._actions = actions;
    }

    public targetEntity(): LEntity {
        return REGame.world.entity(this._targetEntityId);
    }

    public actions(): DActionId[] {
        return this._actions;
    }
}
