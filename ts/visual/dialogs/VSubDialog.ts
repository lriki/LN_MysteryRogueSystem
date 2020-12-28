import { assert } from "ts/Common";
import { REDialogContext } from "ts/system/REDialog";
import { RESystem } from "ts/system/RESystem";
import { REVisual } from "../REVisual";
import { DialogResultCallback, REDialogVisualNavigator } from "./REDialogVisual";
import { VDialog } from "./VDialog";


export class VSubDialog extends VDialog {
    
    
    protected push(dialog: VSubDialog, result?: DialogResultCallback) {
        dialog._resultCallback = result;
        REVisual.manager?._dialogNavigator.push(dialog);
    }

    protected submit(result?: any) {
        REVisual.manager?._dialogNavigator.pop(true, result);
    }

    protected cancel() {
        REVisual.manager?._dialogNavigator.pop(false);
    }

    
    protected doneDialog(consumeAction: boolean) {
        assert(this._navigator);
        this._navigator.clear();
        return RESystem.dialogContext.closeDialog(consumeAction);
    }
    
}

