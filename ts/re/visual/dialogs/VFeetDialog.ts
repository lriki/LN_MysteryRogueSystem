import { assert } from "ts/re/Common";
import { DActionId } from "ts/re/data/DAction";
import { LFeetDialog } from "ts/re/system/dialogs/SFeetDialog";
import { RESystem } from "ts/re/system/RESystem";
import { VDialog } from "./VDialog";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { VFlexCommandWindow } from "../windows/VFlexCommandWindow";
import { VEntityCaptionWindow } from "../windows/VEntityCaptionWindow";

/**
 * [足元]
 */
export class VFeetDialog extends VDialog {
    //_targetEntity: LEntity;
   // _actions: DActionId[];
    _model: LFeetDialog;
    _entityNameWindow: VEntityCaptionWindow | undefined;
    _commandWindow: VFlexCommandWindow | undefined;

    constructor(model: LFeetDialog) {
        super(model);
        this._model = model;
    }
    
    onCreate() {
        const y = 100;
        const cw = 200;

        this._entityNameWindow = new VEntityCaptionWindow(this._model.targetEntity());//new Rectangle(0, y, Graphics.boxWidth - cw, 100)
        //this._entityNameWindow.setText("階段");
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
