import { SDialogContext } from "ts/mr/system/SDialogContext";
import { SDialog } from "../SDialog";

export class SPlayerDialog extends SDialog
{
    dashingEntry: boolean = false;

    onUpdate(context: SDialogContext): void {
        //console.log("REManualActionDialog.update");
    }
}
