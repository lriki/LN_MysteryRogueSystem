import { assert } from "ts/Common";
import { ActionId } from "ts/data/REData";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { REDialogVisualWindowLayer } from "../REDialogVisual";
import { VActionCommandWindow } from "../windows/VActionCommandWindow";

/**
 * [足元]
 */
export class VFeetDialog extends REDialogVisualWindowLayer {
    _targetEntity: REGame_Entity;
    _actions: ActionId[];
    _entityNameWindow: Window_Help | undefined;
    _commandWindow: VActionCommandWindow | undefined;

    constructor(targetEntity: REGame_Entity, actions: ActionId[]) {
        super();
        this._targetEntity = targetEntity;
        this._actions = actions;
    }
    
    onCreate() {
        const y = 100;
        const cw = 200;

        this._entityNameWindow = new Window_Help(new Rectangle(0, y, Graphics.boxWidth - cw, 100));
        this._entityNameWindow.setText("階段");
        this.addWindow(this._entityNameWindow);

        this._commandWindow = new VActionCommandWindow(new Rectangle(Graphics.boxWidth - cw, y, 200, 200));
        
        const self = this;
        this._commandWindow.setActionList2(this._actions.map(actionId => {
            return {
                actionId: actionId,
                handler: (x) => self.onAction(x),
            };
        }));
        this._commandWindow.setHandler("cancel", () => this.pop());
        this.addWindow(this._commandWindow);
        this._commandWindow.open();
    }

    private onAction(actionId: ActionId) {
        const entity = this.dialogContext().causeEntity();
        assert(entity);

        this.dialogContext().postAction(actionId, entity, this._targetEntity);
        this.doneDialog(true);
    }
}
