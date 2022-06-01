import { tr2 } from "ts/re/Common";
import { DActionId } from "ts/re/data/DAction";
import { REBasics } from "ts/re/data/REBasics";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LStorageBehavior } from "ts/re/objects/behaviors/LStorageBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { LEntityId } from "ts/re/objects/LObject";
import { REGame } from "ts/re/objects/REGame";
import { SDialog } from "../SDialog";
import { SCommonCommand } from "./SCommonCommand";
import { SDialogCommand } from "./SDialogCommand";
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
    
    
    public makeActionList(): SDialogCommand[] {
        const item = this.targetEntity();
        const actor = this.actor;
        let commands: SDialogCommand[] = [];
        
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
        
        return commands.concat(SItemListDialog.normalizeActionList(actualActions).map(a => SDialogCommand.makeActivityCommand(a, _ => this.handleAction(a))));
    }

    private handleAction(actionId: DActionId): void {
        SCommonCommand.handleAction(this, this.actor, this.actor.getEntityBehavior(LInventoryBehavior), this.targetEntity(), actionId);
    }

    // public makeActionList(): DActionId[] {
    //     const actor = this.actor;
    //     const item = this.targetEntity();
        
    //     // itemEntity が受け取れる Action を、actor が実行できる Action でフィルタすると、
    //     // 実際に実行できる Action のリストができる。
    //     const actions = actor.queryActions();
    //     const reactions = item.queryReactions();
    //     const actualActions = reactions
    //         .filter(actionId => actions.includes(actionId))
    //         .distinct();

    //     // [撃つ] があれば [投げる] を除く
    //     {
    //         if (actualActions.includes(REBasics.actions.ShootingActionId)) {
    //             actualActions.mutableRemove(x => x == REBasics.actions.ThrowActionId);
    //         }
    //     }

    //     return SItemListDialog.normalizeActionList(actualActions);
    // }
}
