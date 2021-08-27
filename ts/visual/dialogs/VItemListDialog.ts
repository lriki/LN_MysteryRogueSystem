import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { SItemListDialog, SItemListMode } from "ts/system/dialogs/SItemListDialog";
import { LEquipmentUserBehavior } from "ts/objects/behaviors/LEquipmentUserBehavior";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/objects/LEntity";
import { RESystem } from "ts/system/RESystem";
import { VItemListWindow } from "../windows/VItemListWindow";
import { VDialog } from "./VDialog";
import { REGame } from "ts/objects/REGame";
import { LActivity } from "ts/objects/activities/LActivity";
import { REData } from "ts/data/REData";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { LStorageBehavior } from "ts/objects/behaviors/LStorageBehavior";
import { assert, tr2 } from "ts/Common";
import { TileShape } from "ts/objects/LBlock";
import { SDetailsDialog } from "ts/system/dialogs/SDetailsDialog";
import { UAction } from "ts/usecases/UAction";

export class VItemListDialog extends VDialog {
    private _model: SItemListDialog;
    _itemListWindow: VItemListWindow;// | undefined;
    _commandWindow: VFlexCommandWindow | undefined;
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
        super(model);
        this._model = model;

        
        const y = 100;
        const cw = 200;
        this._itemListWindow = new VItemListWindow(new Rectangle(0, y, Graphics.boxWidth - cw, 400));
        this._itemListWindow.setInventory(this._model.inventory());
        this._itemListWindow.setHandler("ok", this.handleItemOk.bind(this));
        this._itemListWindow.setHandler("cancel", this.handleItemCancel.bind(this));
        this._itemListWindow.forceSelect(0);
        this.addWindow(this._itemListWindow);

        /*
        this._peekItemListWindow = new VItemListWindow(new Rectangle(0, y, Graphics.boxWidth - cw, 400));
        this._peekItemListWindow.setHandler("ok", this.handleItemOk.bind(this));
        this._peekItemListWindow.setHandler("cancel", this.handleItemCancel.bind(this));
        this._peekItemListWindow.forceSelect(0);
        this.addWindow(this._itemListWindow);
        */

        const equipmentUser = this._model.entity().findBehavior(LEquipmentUserBehavior);
        if (equipmentUser) {
            this._itemListWindow.setEquipmentUser(equipmentUser);
        }
    }
    
    onCreate() {
        const y = 100;
        const cw = 200;

        this._commandWindow = new VFlexCommandWindow(new Rectangle(Graphics.boxWidth - cw, y, 200, 200));
        this._commandWindow.setHandler("cancel", () => this.handleCommandCancel());
        this.addWindow(this._commandWindow);

        this.activateItemWindow();
    }
    
    onUpdate() {
    }

    private handleItemOk(): void {
        switch (this._model.mode()) {
            case SItemListMode.Use:
                this.showCommandListWindow();
                break;
            case SItemListMode.Selection:
                this._model.setSelectedEntity(this._itemListWindow.selectedItem());
                this.submit();
                break;
            default:
                throw new Error("Unreachable.");
        }
    }
        
    private handleItemCancel(): void {
        this.cancel();
    }


    handleCommandCancel(): void {
        if (this._itemListWindow && this._commandWindow) {
            this._itemListWindow.activate();
            this._commandWindow.deactivate();
            this._commandWindow.openness = 0;
        }
    }

    private handleAction(actionId: DActionId): void {
        if (this._itemListWindow) {
            const itemEntity = this._itemListWindow.selectedItem();
            
            if (UAction.checkItemSelectionRequired(itemEntity, actionId)) {
                // 対象アイテムの選択が必要
                
                const model = new SItemListDialog(this._model.entity(), this._model.inventory(), SItemListMode.Selection);
                this.openSubDialog(model, (result: any) => {
                    const item = model.selectedEntity();
                    assert(item);
                    const activity = (new LActivity).setup(actionId, this._model.entity(), itemEntity, this._model.entity().dir);
                    activity.setObjects2([item]);
                    RESystem.dialogContext.postActivity(activity);
                    this.submit();
                });
            }
            else {
                const activity = (new LActivity).setup(actionId, this._model.entity(), itemEntity, this._model.entity().dir);
                RESystem.dialogContext.postActivity(activity);
                this.submit();
            }
        }
    }

    private handlePeek(): void {
        const itemEntity = this._itemListWindow.selectedItem();
        const inventory = itemEntity.getBehavior(LInventoryBehavior);
        this.openSubDialog(new SItemListDialog(this._model.entity(), inventory, SItemListMode.Selection), (result: any) => {
            this.submit();
        });
    }

    private handlePutIn(): void {
        const storage = this._itemListWindow.selectedItem();
        const model = new SItemListDialog(this._model.entity(), this._model.inventory(), SItemListMode.Selection);
        this.openSubDialog(model, (result: any) => {
            const item = model.selectedEntity();
            assert(item);
            const activity = LActivity.makePutIn(this._model.entity(), storage, item);
            RESystem.dialogContext.postActivity(activity);

            console.log("handlePutIn gogo");
            this.submit();
        });
    }

    private handleDetails(): void {
        const itemEntity = this._itemListWindow.selectedItem();
        const model = new SDetailsDialog(itemEntity);
        this.openSubDialog(model, (result: any) => {
            this.activateCommandWindow();
        });
    }

    private activateItemWindow() {
        if (this._itemListWindow) {
            this._itemListWindow.refresh();
            this._itemListWindow.activate();
        }
    }

    private activateCommandWindow() {
        if (this._commandWindow) {
            this._itemListWindow.deactivate();
            this._commandWindow.refresh();
            this._commandWindow.openness = 255;
            this._commandWindow.activate();
        }
    }

    private showCommandListWindow(): void {

        if (this._itemListWindow && this._commandWindow) {
            this._commandWindow.clear();

            const itemEntity = this._itemListWindow.selectedItem();
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
                    const equipments = actorEntity.getBehavior(LEquipmentUserBehavior);
                    if (equipments.isEquipped(itemEntity))
                        actualActions.mutableRemove(x => x == DBasics.actions.EquipActionId);   // [装備] を除く
                    else
                        actualActions.mutableRemove(x => x == DBasics.actions.EquipOffActionId);  // [はずす] を除く
                }
    
                // 足元に何かあれば [置く] を [交換] にする
                {
                    const feetEntity = REGame.map.firstFeetEntity(actorEntity);
                    if (feetEntity) {
                        if (actualActions.mutableRemove(x => x == DBasics.actions.PutActionId)) {
                            actualActions.push(DBasics.actions.ExchangeActionId);
                        }
                    }
                }
    
                // [撃つ] があれば [投げる] を除く
                {
                    if (actualActions.includes(DBasics.actions.ShootingActionId)) {
                        actualActions.mutableRemove(x => x == DBasics.actions.ThrowActionId);
                    }
                }

                if (itemEntity.hasBehavior(LStorageBehavior)) {
                    this._commandWindow.addSystemCommand(tr2("見る"), "peek", x => this.handlePeek());
                    this._commandWindow.addSystemCommand(tr2("入れる"), "putIn", x => this.handlePutIn());
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
                this._commandWindow.addActionCommand(actionId, `act#${actionId}`, x => this.handleAction(x));
            }

            // [説明] を終端に追加
            this._commandWindow.addSystemCommand(tr2("説明"), "details", x => this.handleDetails());

            /*
            const self = this;
            this._commandWindow.setActionList2(actualActions.map(actionId => {
                return {
                    actionId: actionId,
                    handler: (x) => self.onAction(x),
                };
            }));
            */

            this.activateCommandWindow();
        }
    }

}
