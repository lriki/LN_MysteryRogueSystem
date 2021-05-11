import { assert } from "ts/Common";
import { DActionId } from "ts/data/DAction";
import { LFeetDialog } from "ts/system/dialogs/LFeetDialog";
import { LEntity } from "ts/objects/LEntity";
import { RESystem } from "ts/system/RESystem";
import { SActivityFactory } from "ts/system/SActivityFactory";
import { VActionCommandWindow } from "../windows/VActionCommandWindow";
import { VDialog } from "./VDialog";

/**
 * [足元]
 */
export class VFeetDialog extends VDialog {
    //_targetEntity: LEntity;
   // _actions: DActionId[];
   _model: LFeetDialog;
    _entityNameWindow: Window_Help | undefined;
    _commandWindow: VActionCommandWindow | undefined;

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

        this._commandWindow = new VActionCommandWindow(new Rectangle(Graphics.boxWidth - cw, y, 200, 200));
        
        const self = this;
        this._commandWindow.setActionList2(this._model.actions().map(actionId => {
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

        const activity = SActivityFactory.newActivity(actionId);
        // TODO: 壺に "入れる" とかはここで actionId をチェックして実装する
        activity._setup(entity, this._model.targetEntity());

        RESystem.dialogContext.postActivity(activity);
        this._model.submit();
    }
}
