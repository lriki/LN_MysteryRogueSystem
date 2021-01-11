import { assert } from "ts/Common";
import { RESystem } from "ts/system/RESystem";
import { REVisual } from "../REVisual";
import { DialogResultCallback, REDialogVisualNavigator } from "./REDialogVisual";
import { VDialog } from "./VDialog";
import { VSubDialog } from "./VSubDialog";

export class VMainDialog extends VDialog {

    protected openSubDialog(dialog: VSubDialog, result?: DialogResultCallback) {
        dialog._resultCallback = result;
        REVisual.manager?._dialogNavigator.push(dialog);
    }

}