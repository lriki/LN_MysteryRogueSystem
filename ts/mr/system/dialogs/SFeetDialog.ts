import { tr2 } from "ts/mr/Common";
import { DActionId } from "ts/mr/data/DCommon";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { LStorageBehavior } from "ts/mr/objects/behaviors/LStorageBehavior";
import { LEntity } from "ts/mr/objects/LEntity";
import { LEntityId } from "ts/mr/objects/LObject";
import { REGame } from "ts/mr/objects/REGame";
import { SDialog } from "../SDialog";
import { SCommonCommand } from "./SCommonCommand";
import { SDialogCommand } from "./SDialogCommand";
import { SItemListDialog } from "./SItemListDialog";

export class SFeetDialog extends SDialog {
    private _actorEntityId: LEntityId;
    private _itemEntityId: LEntityId;

    constructor(actorEntity: LEntity, targetEntity: LEntity) {
        super();
        this._actorEntityId = actorEntity.entityId();
        this._itemEntityId = targetEntity.entityId();
    }

    public get actor(): LEntity {
        return REGame.world.entity(this._actorEntityId);
    }

    public get item(): LEntity {
        return REGame.world.entity(this._itemEntityId);
    }
    
    
    public makeActionList(): SDialogCommand[] {
        const item = this.item;
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
            if (actualActions.includes(MRBasics.actions.ShootingActionId)) {
                actualActions.mutableRemove(x => x == MRBasics.actions.ThrowActionId);
            }
        }
        
        const result = commands.concat(SItemListDialog.normalizeActionList(actualActions).map(a => SDialogCommand.makeActivityCommand(a, _ => this.handleAction(a))));
        return result;
    }

    private handleAction(actionId: DActionId): void {
        SCommonCommand.handleAction(this, this.actor, this.actor.getEntityBehavior(LInventoryBehavior), this.item, actionId);
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