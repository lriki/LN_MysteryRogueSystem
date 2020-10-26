import { REDialogContext } from "../RE/REDialog";
import { REDialogVisual } from "./REDialogVisual";

export class REManualActionDialogVisual extends REDialogVisual {

    onUpdate(context: REDialogContext) {
        if (Input.dir8 != 0) {
            //context.commandContext().postAction()
            console.log("dir", Input.dir8);
        }
    }
}

