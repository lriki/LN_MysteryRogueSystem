import { assert, tr2 } from "ts/mr/Common";
import { DActionId } from "ts/mr/data/DCommon";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { LEquipmentUserBehavior } from "ts/mr/objects/behaviors/LEquipmentUserBehavior";
import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { LStorageBehavior } from "ts/mr/objects/behaviors/LStorageBehavior";
import { LEntity } from "ts/mr/objects/LEntity";
import { LBehaviorId, LEntityId } from "ts/mr/objects/LObject";
import { REGame } from "ts/mr/objects/REGame";
import { UAction } from "ts/mr/usecases/UAction";
import { RESystem } from "../RESystem";
import { SDialog } from "../SDialog";
import { SCommonCommand } from "./SCommonCommand";
import { SDialogCommand } from "./SDialogCommand";
import { SItemSelectionDialog } from "./SItemSelectionDialog";

export class SItemListDialog extends SDialog {
    private _actorEntityId: LEntityId;
    private _inventoryBehaviorId: LBehaviorId;
    private _selectedEntity: LEntity | undefined;

    public constructor(actorEntity: LEntity, inventory: LInventoryBehavior) {
        super();
        this._actorEntityId = actorEntity.entityId();
        this._inventoryBehaviorId = inventory.id();
    }

    public get actor(): LEntity {
        return REGame.world.entity(this._actorEntityId);
    }

    public get inventory(): LInventoryBehavior {
        return REGame.world.behavior(this._inventoryBehaviorId) as LInventoryBehavior;
    }

    public setSelectedEntity(entity: LEntity): void {
        this._selectedEntity = entity;
    }

    public selectedEntity(): LEntity {
        assert(this._selectedEntity);
        return this._selectedEntity;
    }

    public makeActionList(item: LEntity): SDialogCommand[] {
        const actor = this.actor;
        let commands: SDialogCommand[] = [];

        
        if (item.findEntityBehavior(LStorageBehavior)) {
            commands.push(SDialogCommand.makeSystemCommand("peek", tr2("見る"), _ => this.handlePeek()));
            commands.push(SDialogCommand.makeSystemCommand("putIn", tr2("入れる"), _ => this.handlePutIn()));
        }
        
        
        if (item.data.shortcut) {
            const equipments = actor.getEntityBehavior(LEquipmentUserBehavior);
            const shorcutItem = equipments.shortcutItem;
            if (shorcutItem && shorcutItem == item) {
                commands.push(SDialogCommand.makeSystemCommand(tr2("はずす"), "UnsetShortcutSet", _ => this.handleShortcutUnset()));
            }
            else {
                commands.push(SDialogCommand.makeSystemCommand(tr2("セット"), "SetShortcutSet", _ => this.handleShortcutSet()));
            }
        }
        
        
        // itemEntity が受け取れる Action を、actor が実行できる Action でフィルタすると、
        // 実際に実行できる Action のリストができる。
        const actions = actor.queryActions();
        const reactions = item.queryReactions();
        const actualActions = reactions
            .filter(actionId => actions.includes(actionId))
            .distinct();

        // コマンドカスタマイズ。
        // ここで行うのはあくまで見た目に関係するもの。
        // Actor や Item が性質として持っている ActionList と、実際に UI からどれを選択できるようにするかは別物なので、
        // 例えば「Item に非表示 Action を持たせる」みたいな案があったが、それはやっぱりおかしいだろう。
        // 操作性はタイトルとして決める。そしてタイトルごとに大きく変えるべきは View。なのでここで対応してみる。
        {
            // [装備] [はずす] チェック
            {
                const equipments = actor.getEntityBehavior(LEquipmentUserBehavior);
                if (equipments.isEquipped(item))
                    actualActions.mutableRemove(x => x == MRBasics.actions.EquipActionId);   // [装備] を除く
                else
                    actualActions.mutableRemove(x => x == MRBasics.actions.EquipOffActionId);  // [はずす] を除く
            }

            // 足元に何かあれば [置く] を [交換] にする
            {
                const feetEntity = REGame.map.firstFeetEntity(actor);
                if (feetEntity) {
                    if (actualActions.mutableRemove(x => x == MRBasics.actions.PutActionId)) {
                        actualActions.push(MRBasics.actions.ExchangeActionId);
                    }
                }
            }

            // [撃つ] があれば [投げる] を除く
            {
                if (actualActions.includes(MRBasics.actions.ShootingActionId)) {
                    actualActions.mutableRemove(x => x == MRBasics.actions.ThrowActionId);
                }
            }
        }

        commands = commands.concat(SItemListDialog.normalizeActionList(actualActions).map(a => SDialogCommand.makeActivityCommand(a, _ => this.handleAction(a))));



        return commands;
    }

    public static normalizeActionList(actions: DActionId[]): DActionId[] {
        return actions
            .distinct()
            .immutableSort((a, b) => {
                const ad = MRData.actions[a];
                const bd = MRData.actions[b];
                if (ad.priority == bd.priority) return ad.id - bd.id;
                return bd.priority - ad.priority;   // 降順
            });
    }

    private handleAction(actionId: DActionId): void {
        const itemEntity = this.selectedEntity();
        SCommonCommand.handleAction(this, this.actor, this.inventory, itemEntity, actionId);
    }

    private handleShortcutSet(): void {
        const itemEntity = this.selectedEntity();
        const equipmentUser = this.actor.getEntityBehavior(LEquipmentUserBehavior);
        equipmentUser.equipOnShortcut(RESystem.commandContext, itemEntity);
        this.closeAllSubDialogs();
    }

    private handleShortcutUnset(): void {
        const itemEntity = this.selectedEntity();
        const equipmentUser = this.actor.getEntityBehavior(LEquipmentUserBehavior);
        equipmentUser.equipOffShortcut(RESystem.commandContext, itemEntity);
        this.closeAllSubDialogs();
    }

    private handlePeek(): void {
        const itemEntity = this.selectedEntity();
        const inventory = itemEntity.getEntityBehavior(LInventoryBehavior);
        this.openSubDialog(new SItemSelectionDialog(this.actor, inventory), (result: SItemSelectionDialog) => {
            //this.submit();
            return false;
        });
    }

    private handlePutIn(): void {
        const storage = this.selectedEntity();
        const model = new SItemSelectionDialog(this.actor, this.inventory);
        this.openSubDialog(model, (result: SItemSelectionDialog) => {
            const item = model.selectedEntity();
            assert(item);
            const activity = LActivity.makePutIn(this.actor, storage, item);
            RESystem.dialogContext.postActivity(activity);
            this.submit();
            return false;
        });
    }
}
