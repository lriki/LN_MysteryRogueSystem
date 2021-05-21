import { SDialogContext } from "ts/system/SDialogContext";
import { SDialog } from "../SDialog";

export class REManualActionDialog extends SDialog
{
    dashingEntry: boolean = false;

    onUpdate(context: SDialogContext): void {
        //console.log("REManualActionDialog.update");
    }
}
