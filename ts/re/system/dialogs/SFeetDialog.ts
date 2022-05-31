import { DActionId } from "ts/re/data/DAction";
import { REBasics } from "ts/re/data/REBasics";
import { LEntity } from "ts/re/objects/LEntity";
import { LEntityId } from "ts/re/objects/LObject";
import { REGame } from "ts/re/objects/REGame";
import { SDialog } from "../SDialog";
import { SItemListDialog } from "./SItemListDialog";

export class LFeetDialog extends SDialog {
    private _actorEntityId: LEntityId;
    private _targetEntityId: LEntityId;

    constructor(actorEntity: LEntity, targetEntity: LEntity) {
        super();
        this._actorEntityId = actorEntity.entityId();
        this._targetEntityId = targetEntity.entityId();
    }

    public get actor(): LEntity {
        return REGame.world.entity(this._actorEntityId);
    }

    public targetEntity(): LEntity {
        return REGame.world.entity(this._targetEntityId);
    }
    
    public makeActionList(): DActionId[] {
        const actor = this.actor;
        const item = this.targetEntity();
        
        // itemEntity が受け取れる Action を、actor が実行できる Action でフィルタすると、
        // 実際に実行できる Action のリストができる。
        const actions = actor.queryActions();
        const reactions = item.queryReactions();
        const actualActions = reactions
            .filter(actionId => actions.includes(actionId))
            .distinct();

        // [撃つ] があれば [投げる] を除く
        {
            if (actualActions.includes(REBasics.actions.ShootingActionId)) {
                actualActions.mutableRemove(x => x == REBasics.actions.ThrowActionId);
            }
        }

        return SItemListDialog.normalizeActionList(actualActions);
    }
}
