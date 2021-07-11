import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { SItemListDialog } from "ts/system/dialogs/SItemListDialog";
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

export class VItemListDialog extends VDialog {
    private _model: SItemListDialog;
    _itemListWindow: VItemListWindow;// | undefined;
    _commandWindow: VFlexCommandWindow | undefined;

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
        this._itemListWindow = new VItemListWindow(this._model.inventory(), new Rectangle(0, y, Graphics.boxWidth - cw, 400));
        this._itemListWindow.setHandler("ok", this.handleItemOk.bind(this));
        this._itemListWindow.setHandler("cancel", this.handleItemCancel.bind(this));
        this._itemListWindow.forceSelect(0);
        this.addWindow(this._itemListWindow);

        const equipmentUser = this._model.entity().findBehavior(LEquipmentUserBehavior);
        if (equipmentUser) {
            this._itemListWindow.setEquipmentUser(equipmentUser);
        }
    }
    
    onCreate() {
        const y = 100;
        const cw = 200;


        //const actions = [DBasics.actions.PickActionId, DBasics.actions.AttackActionId];
        //this._commandWindow = new VActionCommandWindow(new Rectangle(Graphics.boxWidth - cw, y, 200, 200));
        //this._commandWindow.setHandler("cancel", this.onCommandCancel.bind(this));
        //this.addWindow(this._commandWindow);

        this._commandWindow = new VFlexCommandWindow(new Rectangle(Graphics.boxWidth - cw, y, 200, 200));
        this.addWindow(this._commandWindow);


        this.activateItemWindow();
    }
    
    onUpdate() {
    }

    private handleItemOk(): void {
        if (this._itemListWindow && this._commandWindow) {

            const itemEntity = this._itemListWindow.selectedItem();
            const actorEntity = this._model.entity();

            // itemEntity が受け取れる Action を、actor が実行できる Action でフィルタすると、
            // 実際に実行できる Action のリストができる。
            const actions = actorEntity.queryActions();
            const reactions = itemEntity.queryReactions();
            const actualActions = reactions
                .filter(actionId => actions.includes(actionId))
                .distinct()
                .sort((a, b) => {
                    const ad = REData.actions[a];
                    const bd = REData.actions[b];
                    if (ad.priority == bd.priority) return ad.id - bd.id;
                    return bd.priority - ad.priority;   // 降順
                });
            

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

            for (const actionId of actualActions) {
                this._commandWindow.addActionCommand(actionId, `act#${actionId}`, x => this.handleAction(x));
            }

            /*
            const self = this;
            this._commandWindow.setActionList2(actualActions.map(actionId => {
                return {
                    actionId: actionId,
                    handler: (x) => self.onAction(x),
                };
            }));
            */

            this._itemListWindow.deactivate();
            this._commandWindow.makeCommandList();
            this._commandWindow.openness = 255;
            this._commandWindow.activate();
        }
    }
        
    private handleItemCancel(): void {
        this.cancel();
    }


    onCommandCancel(): void {
        if (this._itemListWindow && this._commandWindow) {
            this._itemListWindow.activate();
            this._commandWindow.deactivate();
            this._commandWindow.openness = 0;
        }
    }

    private handleAction(actionId: DActionId): void {
        if (this._itemListWindow) {
            const itemEntity = this._itemListWindow.selectedItem();
            
            // TODO: 壺に "入れる" とかはここで actionId をチェックして実装する
            

            const activity = new LActivity(actionId, this._model.entity(), itemEntity, this._model.entity().dir);
            RESystem.dialogContext.postActivity(activity);
            this.submit();
        }
    }

    private activateItemWindow() {
        if (this._itemListWindow) {
            this._itemListWindow.refresh();
            this._itemListWindow.activate();
        }
    };

}
