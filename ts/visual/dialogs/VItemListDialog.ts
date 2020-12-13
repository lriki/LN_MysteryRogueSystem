import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { ActionId, REData } from "ts/data/REData";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { REDialogContext } from "ts/system/REDialog";
import { REDialogVisualWindowLayer } from "../REDialogVisual";
import { VActionCommandWindow, ActionCommand } from "../windows/VActionCommandWindow";
import { VItemListWindow } from "../windows/VItemListWindow";

export class VItemListDialog extends REDialogVisualWindowLayer {
    _actorEntity: REGame_Entity;
    _inventory: LInventoryBehavior;
    _itemListWindow: VItemListWindow;// | undefined;
    _commandWindow: VActionCommandWindow | undefined;

    /**
     * 
     * @param actorEntity
     * @param inventory 
     * 
     * actorEntity はアイテム使用者。
     * 必ずしも Inventory を持っている Entity ではない点に注意。
     * 足元に置いてある壺の中を覗いたときは、actorEntity は Player となる。
     */
    constructor(actorEntity: REGame_Entity, inventory: LInventoryBehavior) {
        super();
        this._actorEntity = actorEntity;
        this._inventory = inventory;
        
        const y = 100;
        const cw = 200;
        this._itemListWindow = new VItemListWindow(this._inventory, new Rectangle(0, y, Graphics.boxWidth - cw, 400));
        this._itemListWindow.setHandler("ok", this.onItemOk.bind(this));
        this._itemListWindow.setHandler("cancel", this.onItemCancel.bind(this));
        this._itemListWindow.forceSelect(0);
        this.addWindow(this._itemListWindow);
    }
    
    onCreate() {
        const y = 100;
        const cw = 200;


        //const actions = [DBasics.actions.PickActionId, DBasics.actions.AttackActionId];
        this._commandWindow = new VActionCommandWindow(new Rectangle(Graphics.boxWidth - cw, y, 200, 200));
        this._commandWindow.setHandler("cancel", this.onCommandCancel.bind(this));
        this.addWindow(this._commandWindow);

        this.activateItemWindow();
    }
    
    onUpdate(context: REDialogContext) {
    }

    onItemOk(): void {
        if (this._itemListWindow && this._commandWindow) {

            const itemEntity = this._itemListWindow.selectedItem();

            // itemEntity が受け取れる Action を、actor が実行できる Action でフィルタすると、
            // 実際に実行できる Action のリストができる。
            const actorActions = this._actorEntity.queryActions();
            const actualActions = itemEntity.queryReactions().filter(actionId => actorActions.includes(actionId));
            const self = this;
            this._commandWindow.setActionList2(actualActions.map(actionId => {
                return {
                    actionId: actionId,
                    handler: (x) => self.onAction(x),
                };
            }));

            this._itemListWindow.deactivate();
            this._commandWindow.openness = 255;
            this._commandWindow.activate();
        }
        console.log("onItemOk", this);
    }
        
    onItemCancel(): void {
        this.pop();
    }

    onCommandCancel(): void {
        if (this._itemListWindow && this._commandWindow) {
            this._itemListWindow.activate();
            this._commandWindow.deactivate();
            this._commandWindow.openness = 0;
        }
    }

    onAction(actionId: ActionId): void {
        if (this._itemListWindow) {
            const itemEntity = this._itemListWindow.selectedItem();
            this.dialogContext().postAction(actionId, this._actorEntity, itemEntity);
            this.doneDialog(true);
        }
    }

    private activateItemWindow() {
        if (this._itemListWindow) {
            this._itemListWindow.refresh();
            this._itemListWindow.activate();
        }
    };

}
