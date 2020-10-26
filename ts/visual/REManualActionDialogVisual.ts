import { REDialogContext } from "../RE/REDialog";
import { REDialogVisual } from "./REDialogVisual";

export class REManualActionDialogVisual extends REDialogVisual {

    onUpdate(context: REDialogContext) {
        console.log("REManualActionDialogVisual.update");
    }
}

