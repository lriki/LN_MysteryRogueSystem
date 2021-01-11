import { assert } from "ts/Common";
import { DActionId } from "ts/data/DAction";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { RESystem } from "ts/system/RESystem";
import { VActionCommandWindow } from "../windows/VActionCommandWindow";
import { VSubDialog } from "./VSubDialog";

/**
 * [足元]
 */
export class VFeetDialog extends VSubDialog {
    _targetEntity: REGame_Entity;
    _actions: DActionId[];
    _entityNameWindow: Window_Help | undefined;
    _commandWindow: VActionCommandWindow | undefined;

    constructor(targetEntity: REGame_Entity, actions: DActionId[]) {
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
        this._commandWindow.setHandler("cancel", () => this.cancel());
        this.addWindow(this._commandWindow);
        this._commandWindow.open();
    }

    private onAction(actionId: DActionId) {
        const entity = RESystem.dialogContext.causeEntity();
        assert(entity);

        RESystem.dialogContext.postAction(actionId, entity, this._targetEntity);
        this.doneDialog(true);
    }
}