import { DActionId } from "ts/re/data/DAction";
import { REBasics } from "ts/re/data/REBasics";
import { SItemListDialog, SItemListMode } from "ts/re/system/dialogs/SItemListDialog";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { RESystem } from "ts/re/system/RESystem";
import { VItemListWindow } from "../windows/VItemListWindow";
import { VDialog } from "./VDialog";
import { REGame } from "ts/re/objects/REGame";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { REData } from "ts/re/data/REData";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { LStorageBehavior } from "ts/re/objects/behaviors/LStorageBehavior";
import { assert, tr2 } from "ts/re/Common";
import { LTileShape } from "ts/re/objects/LBlock";
import { SDetailsDialog } from "ts/re/system/dialogs/SDetailsDialog";
import { UAction } from "ts/re/usecases/UAction";
import { VItemListDialogBase } from "./VItemListDialogBase";
import { UInventory } from "ts/re/usecases/UInventory";

export class VItemListDialog extends VItemListDialogBase {
    private _model: SItemListDialog;
    // _itemListWindow: VItemListWindow;// | undefined;
    // _commandWindow: VFlexCommandWindow | undefined;
    //_peekItemListWindow: VItemListWindow;

    /**
     * 
     * @param actorEntity
     * @param inventory 
     * 
     * actorEntity はアイテム使用者。
     * 必ずしも Inventory を持っている Entity ではない点に注意。
     * 足元に置いてある壺の中を覗いたときは、actorEntity は Player となる。
     */
    constructor(model: SItemListDialog) {
        super(model.inventory(), model);
        this._model = model;

        
        // const y = 100;
        // const cw = 200;
        // this._itemListWindow = new VItemListWindow(new Rectangle(0, y, Graphics.boxWidth - cw, 400));
        // this._itemListWindow.setInventory(this._model.inventory());
        // this._itemListWindow.setHandler("ok", this.handleItemOk.bind(this));
        // this._itemListWindow.setHandler("cancel", this.handleItemCancel.bind(this));
        // this._itemListWindow.forceSelect(0);
        // this.addWindow(this._itemListWindow);

        /*
        this._peekItemListWindow = new VItemListWindow(new Rectangle(0, y, Graphics.boxWidth - cw, 400));
        this._peekItemListWindow.setHandler("ok", this.handleItemOk.bind(this));
        this._peekItemListWindow.setHandler("cancel", this.handleItemCancel.bind(this));
        this._peekItemListWindow.forceSelect(0);
        this.addWindow(this._itemListWindow);
        */

        const equipmentUser = this._model.entity().findEntityBehavior(LEquipmentUserBehavior);
        if (equipmentUser) {
            this.itemListWindow.setEquipmentUser(equipmentUser);
        }
    }
    
    onCreate() {
        super.onCreate();
        // const y = 100;
        // const cw = 200;

        // this._commandWindow = new VFlexCommandWindow(new Rectangle(Graphics.boxWidth - cw, y, 200, 200));
        // this._commandWindow.setHandler("cancel", () => this.handleCommandCancel());
        // this.addWindow(this._commandWindow);

    }
    
    onUpdate() {
        if (this._model.mode() == SItemListMode.Use) {
            if (Input.isTriggered("pagedown")) {
                UInventory.sort(this._model.inventory());
                this.itemListWindow.refreshItems();
                this.itemListWindow.playCursorSound();
            }
        }
    }

    // private handleItemOk(): void {
    //     switch (this._model.mode()) {
    //         case SItemListMode.Use:
    //             this.showCommandListWindow();
    //             break;
    //         case SItemListMode.Selection:
    //             this._model.setSelectedEntity(this._itemListWindow.selectedItem());
    //             this.submit();
    //             break;
    //         default:
    //             throw new Error("Unreachable.");
    //     }
    // }
        
    // private handleItemCancel(): void {
    //     this.cancel();
    // }


    // handleCommandCancel(): void {
    //     if (this._itemListWindow && this._commandWindow) {
    //         this._itemListWindow.activate();
    //         this._commandWindow.deactivate();
    //         this._commandWindow.openness = 0;
    //     }
    // }

    private handleAction(actionId: DActionId): void {
        const itemEntity = this.itemListWindow.selectedItem();
        
        if (UAction.checkItemSelectionRequired(itemEntity, actionId)) {
            // 対象アイテムの選択が必要
            
            const model = new SItemListDialog(this._model.entity(), this._model.inventory(), SItemListMode.Selection);
            this.openSubDialog(model, (result: SItemListDialog) => {
                if (result.isSubmitted) {
                    const item = model.selectedEntity();
                    assert(item);
                    const activity = (new LActivity).setup(actionId, this._model.entity(), itemEntity, this._model.entity().dir);
                    activity.setObjects2([item]);
                    RESystem.dialogContext.postActivity(activity);
                }
                else {
                    this.activateCommandWindow();
                }
                return false;
            });
        }
        else {
            const activity = (new LActivity).setup(actionId, this._model.entity(), itemEntity, this._model.entity().dir);
            RESystem.dialogContext.postActivity(activity);
            this.submit();
        }
    }

    private handleShortcutSet(): void {
        const itemEntity = this.itemListWindow.selectedItem();
        const equipmentUser = this._model.entity().getEntityBehavior(LEquipmentUserBehavior);
        equipmentUser.equipOnShortcut(RESystem.commandContext, itemEntity);
        this.closeAllSubDialogs();
    }

    private handleShortcutUnset(): void {
        const itemEntity = this.itemListWindow.selectedItem();
        const equipmentUser = this._model.entity().getEntityBehavior(LEquipmentUserBehavior);
        equipmentUser.equipOffShortcut(RESystem.commandContext, itemEntity);
        this.closeAllSubDialogs();
    }

    private handlePeek(): void {
        const itemEntity = this.itemListWindow.selectedItem();
        const inventory = itemEntity.getEntityBehavior(LInventoryBehavior);
        this.openSubDialog(new SItemListDialog(this._model.entity(), inventory, SItemListMode.Selection), (result: SItemListDialog) => {
            //this.submit();
            return false;
        });
    }

    private handlePutIn(): void {
        const storage = this.itemListWindow.selectedItem();
        const model = new SItemListDialog(this._model.entity(), this._model.inventory(), SItemListMode.Selection);
        this.openSubDialog(model, (result: SItemListDialog) => {
            const item = model.selectedEntity();
            assert(item);
            const activity = LActivity.makePutIn(this._model.entity(), storage, item);
            RESystem.dialogContext.postActivity(activity);
            this.submit();
            return false;
        });
    }

    // override
    onMakeCommandList(window: VFlexCommandWindow): void {

        const itemEntity = this.itemListWindow.selectedItem();
        const actorEntity = this._model.entity();

        // itemEntity が受け取れる Action を、actor が実行できる Action でフィルタすると、
        // 実際に実行できる Action のリストができる。
        const actions = actorEntity.queryActions();
        const reactions = itemEntity.queryReactions();
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
                const equipments = actorEntity.getEntityBehavior(LEquipmentUserBehavior);
                if (equipments.isEquipped(itemEntity))
                    actualActions.mutableRemove(x => x == REBasics.actions.EquipActionId);   // [装備] を除く
                else
                    actualActions.mutableRemove(x => x == REBasics.actions.EquipOffActionId);  // [はずす] を除く
            }

            // 足元に何かあれば [置く] を [交換] にする
            {
                const feetEntity = REGame.map.firstFeetEntity(actorEntity);
                if (feetEntity) {
                    if (actualActions.mutableRemove(x => x == REBasics.actions.PutActionId)) {
                        actualActions.push(REBasics.actions.ExchangeActionId);
                    }
                }
            }

            // [撃つ] があれば [投げる] を除く
            {
                if (actualActions.includes(REBasics.actions.ShootingActionId)) {
                    actualActions.mutableRemove(x => x == REBasics.actions.ThrowActionId);
                }
            }

            if (itemEntity.findEntityBehavior(LStorageBehavior)) {
                window.addSystemCommand(tr2("見る"), "peek", x => this.handlePeek());
                window.addSystemCommand(tr2("入れる"), "putIn", x => this.handlePutIn());
            }

            {
                if (itemEntity.data().shortcut) {
                    const equipments = actorEntity.getEntityBehavior(LEquipmentUserBehavior);
                    const shorcutItem = equipments.shortcutItem;
                    if (shorcutItem && shorcutItem == itemEntity) {
                        window.addSystemCommand(tr2("はずす"), "UnsetShortcutSet", x => this.handleShortcutUnset());
                    }
                    else {
                        window.addSystemCommand(tr2("セット"), "SetShortcutSet", x => this.handleShortcutSet());
                    }
                }
            }
        }


        const finalActions = actualActions
            .distinct()
            .immutableSort((a, b) => {
                const ad = REData.actions[a];
                const bd = REData.actions[b];
                if (ad.priority == bd.priority) return ad.id - bd.id;
                return bd.priority - ad.priority;   // 降順
            });
        for (const actionId of finalActions) {
            window.addActionCommand(actionId, `act#${actionId}`, x => this.handleAction(x));
        }

        super.onMakeCommandList(window);
    }

    // private showCommandListWindow(): void {

    //     if (this._itemListWindow && this._commandWindow) {
    //         this._commandWindow.clear();

    //         this.activateCommandWindow();
    //     }
    // }

}
