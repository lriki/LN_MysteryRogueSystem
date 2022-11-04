import { tr2 } from "ts/mr/Common";
import { DActionId } from "ts/mr/data/DCommon";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LStorageBehavior } from "ts/mr/lively/behaviors/LStorageBehavior";
import { LEntity } from "ts/mr/lively/LEntity";
import { LEntityId } from "ts/mr/lively/LObject";
import { MRLively } from "ts/mr/lively/MRLively";
import { SDialog } from "../SDialog";
import { SCommonCommand } from "./SCommonCommand";
import { SDialogCommand } from "./SDialogCommand";
import { SItemListDialog } from "./SItemListDialog";

export class SNicknameDialog extends SDialog {
    private _actorEntityId: LEntityId;
    private _targetItemId: LEntityId;

    constructor(actorEntity: LEntity, targetItem: LEntity) {
        super();
        this._actorEntityId = actorEntity.entityId();
        this._targetItemId = targetItem.entityId();
    }

    // public get actor(): LEntity {
    //     return REGame.world.entity(this._actorEntityId);
    // }

    public get item(): LEntity {
        return MRLively.world.entity(this._targetItemId);
    }

    public setNickname(name: string): void {
        MRLively.getCurrentIdentifyer().setNickname(this.item.dataId, name);
    }
}
