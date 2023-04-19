import { assert, tr2 } from "ts/mr/Common";
import { DActionId } from "ts/mr/data/DCommon";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LStorageBehavior } from "ts/mr/lively/behaviors/LStorageBehavior";
import { LReaction } from "ts/mr/lively/LCommon";
import { LEntity } from "ts/mr/lively/LEntity";
import { LBehaviorId, LEntityId } from "ts/mr/lively/LObject";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "../MRSystem";
import { SDialog } from "../SDialog";
import { SDialogContext } from "../SDialogContext";
import { SCommonCommand } from "./SCommonCommand";
import { SDialogCommand, SDialogSystemCommand } from "./SDialogCommand";
import { SItemSelectionDialog } from "./SItemSelectionDialog";
import { SInventoryDialogBase } from "./SInventoryDialogBase";

export enum SItemListDialogSourceAction {
    Default,
    Peek,
}

export class SItemListDialog extends SInventoryDialogBase {
    private _actorEntityId: LEntityId;
    
    public readonly sourceAction: SItemListDialogSourceAction;

    public constructor(actorEntity: LEntity, inventory: LInventoryBehavior, sourceAction: SItemListDialogSourceAction) {
        super(inventory);
        this._actorEntityId = actorEntity.entityId();
        this.sourceAction = sourceAction;
    }

    public get actor(): LEntity {
        return MRLively.world.entity(this._actorEntityId);
    }


    public makeActionList(): SDialogCommand[] {
        return (!this.isMultiSelectMode) ?
            this.makeActionList_SingleSelected() :
            this.makeActionList_MultiSelected();
    }

    private makeActionList_SingleSelected(): SDialogCommand[] {
        const item = this.selectedSingleEntity();

        // SafetyMap など、ダンジョンマップ以外では ActionList を生成しない
        if (!MRLively.mapView.currentMap.floorId().isTacticsMap2) {
            return [];
        }

        const actor = this.actor;
        let commands: SDialogCommand[] = [];

        if (this.sourceAction == SItemListDialogSourceAction.Peek) {
            commands.push(SDialogCommand.makeSystemCommand(tr2("取り出す"), SDialogSystemCommand.PickOut, _ => this.handlePickOut()));
        }
        else {
            if (item.findEntityBehavior(LStorageBehavior)) {
                commands.push(SDialogCommand.makeSystemCommand(tr2("見る"), SDialogSystemCommand.Peek, _ => this.handlePeek()));
                commands.push(SDialogCommand.makeSystemCommand(tr2("入れる"), SDialogSystemCommand.PutIn, _ => this.handlePutIn()));
            }
        }
        
        
        
        if (item.data.shortcut) {
            const equipments = actor.getEntityBehavior(LEquipmentUserBehavior);
            const shorcutItem = equipments.shortcutItem;
            if (shorcutItem && shorcutItem == item) {
                commands.push(SDialogCommand.makeSystemCommand(tr2("はずす"), SDialogSystemCommand.UnsetShortcutSet, _ => this.handleShortcutUnset()));
            }
            else {
                commands.push(SDialogCommand.makeSystemCommand(tr2("セット"),SDialogSystemCommand.SetShortcutSet, _ => this.handleShortcutSet()));
            }
        }
        
        
        // itemEntity が受け取れる Action を、actor が実行できる Action でフィルタすると、
        // 実際に実行できる Action のリストができる。
        const actions = actor.queryActions();
        const reactions = item.queryReactions();
        const actualActions = reactions
            .filter(x => actions.includes(x.actionId))
            .distinctObjects(x => x.actionId);

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
                    actualActions.mutableRemove(x => x.actionId == MRBasics.actions.EquipActionId);   // [装備] を除く
                else
                    actualActions.mutableRemove(x => x .actionId== MRBasics.actions.EquipOffActionId);  // [はずす] を除く
            }

            // 足元に何かあれば [置く] を [交換] にする
            {
                const feetEntity = MRLively.mapView.currentMap.firstFeetEntity(actor);
                if (feetEntity) {
                    if (actualActions.mutableRemove(x => x.actionId == MRBasics.actions.PutActionId)) {
                        actualActions.push({ actionId: MRBasics.actions.ExchangeActionId });
                    }
                }
            }

            // [撃つ] があれば [投げる] を除く
            {
                if (!!actualActions.find(x => x.actionId == MRBasics.actions.ShootActionId)) {
                    actualActions.mutableRemove(x => x.actionId == MRBasics.actions.ThrowActionId);
                }
            }
        }

        commands = commands.concat(
            SItemListDialog.normalizeActionList(actualActions)
                .map(a => SDialogCommand.makeActivityCommand(a.actionId, a.displayName, _ => this.handleAction(a.actionId)))
            );

        return commands;
    }

    private makeActionList_MultiSelected(): SDialogCommand[] {
        
        let commands: SDialogCommand[] = [];
        if (this.sourceAction == SItemListDialogSourceAction.Peek) {
            commands.push(SDialogCommand.makeSystemCommand(tr2("取り出す"), SDialogSystemCommand.PickOut, _ => this.handlePickOut()));
        }

        return commands;
    }

    public static normalizeActionList(actions: LReaction[]): LReaction[] {
        return actions
            .distinctObjects(x => x.actionId)
            .immutableSort((a, b) => {
                const ad = MRData.skills[a.actionId];
                const bd = MRData.skills[b.actionId];
                if (ad.priority == bd.priority) return ad.id - bd.id;
                return bd.priority - ad.priority;   // 降順
            });
    }

    private handleAction(actionId: DActionId): void {
        const itemEntity = this.selectedSingleEntity();
        SCommonCommand.handleAction(this, this.actor, this.inventory, itemEntity, actionId);
    }

    private handleShortcutSet(): void {
        const itemEntity = this.selectedSingleEntity();
        const equipmentUser = this.actor.getEntityBehavior(LEquipmentUserBehavior);
        equipmentUser.equipOnShortcut(MRSystem.commandContext, itemEntity);
        this.closeAllSubDialogs();
    }

    private handleShortcutUnset(): void {
        const itemEntity = this.selectedSingleEntity();
        const equipmentUser = this.actor.getEntityBehavior(LEquipmentUserBehavior);
        equipmentUser.equipOffShortcut(MRSystem.commandContext, itemEntity);
        this.closeAllSubDialogs();
    }

    private handlePeek(): void {
        const itemEntity = this.selectedSingleEntity();
        const inventory = itemEntity.getEntityBehavior(LInventoryBehavior);
        const model = new SItemListDialog(this.actor, inventory, SItemListDialogSourceAction.Peek);
        model.multipleSelectionEnabled = true;
        this.openSubDialog(model, (result: SItemListDialog) => {
            //this.submit();
            return false;
        });
    }

    private handlePutIn(): void {
        const storage = this.selectedSingleEntity();
        const model = new SItemSelectionDialog(this.actor, this.inventory, true);
        model.multipleSelectionEnabled = true;
        this.openSubDialog(model, (result: SItemSelectionDialog) => {
            console.log("model.selectedEntities()", model.selectedEntities());
            const activity = LActivity.makePutIn(this.actor, storage, model.selectedEntities());
            MRSystem.dialogContext.postActivity(activity);

            this.submit();  // submit にする。 (cancel ではなく)
            return true;    // submit() を呼んだので Handled.
        });
    }

    private handlePickOut(): void {
        const storage = this.inventory.ownerEntity();
        const activity = LActivity.makePickOut(this.actor, storage, this.selectedEntities());
        MRSystem.dialogContext.postActivity(activity);
        this.submit(); 
    }
}
