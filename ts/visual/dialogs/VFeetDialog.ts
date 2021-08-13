import { assert } from "ts/Common";
import { DActionId } from "ts/data/DAction";
import { LFeetDialog } from "ts/system/dialogs/SFeetDialog";
import { LEntity } from "ts/objects/LEntity";
import { RESystem } from "ts/system/RESystem";
import { VDialog } from "./VDialog";
import { LActivity } from "ts/objects/activities/LActivity";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";

/**
 * [足元]
 */
export class VFeetDialog extends VDialog {
    //_targetEntity: LEntity;
   // _actions: DActionId[];
   _model: LFeetDialog;
    _entityNameWindow: Window_Help | undefined;
    _commandWindow: VFlexCommandWindow | undefined;

    constructor(model: LFeetDialog) {
        super(model);
        this._model = model;
    }
    
    onCreate() {
        const y = 100;
        const cw = 200;

        this._entityNameWindow = new Window_Help(new Rectangle(0, y, Graphics.boxWidth - cw, 100));
        this._entityNameWindow.setText("階段");
        this.addWindow(this._entityNameWindow);

        this._commandWindow = new VFlexCommandWindow(new Rectangle(Graphics.boxWidth - cw, y, 200, 200));

        const actualActions = this._model.actions();
        for (const actionId of actualActions) {
            this._commandWindow.addActionCommand(actionId, `act#${actionId}`, x => this.handleAction(x));
        }
        /*
        const self = this;
        this._commandWindow.setActionList2(this._model.actions().map(actionId => {
            return {
                actionId: actionId,
                handler: (x) => self.handleAction(x),
            };
        }));
        */
        this._commandWindow.setHandler("cancel", () => this.cancel());
        this.addWindow(this._commandWindow);
        this._commandWindow.refresh();
        this._commandWindow.open();
    }

    private handleAction(actionId: DActionId) {
        const entity = RESystem.dialogContext.causeEntity();
        assert(entity);

        // TODO: 壺に "入れる" とかはここで actionId をチェックして実装する
        const activity =(new LActivity).setup(actionId, entity, this._model.targetEntity(), entity.dir);

        RESystem.dialogContext.postActivity(activity);
        this._model.submit();
    }
}
