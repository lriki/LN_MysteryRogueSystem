import { REDirectionChangeCommand } from "ts/commands/REDirectionChangeCommand";
import { REData } from "ts/data/REData";
import { REDialogContext } from "../system/REDialog";
import { REDialogVisual } from "./REDialogVisual";

export class REManualActionDialogVisual extends REDialogVisual {

    onUpdate(context: REDialogContext) {
        const entity = context.causeEntity();
        if (!entity) return;

        if (Input.dir8 != 0 && Input.dir8 != entity.dir) {
            const commandContext = context.commandContext();
            commandContext.postAction(REData.actions[REData.DirectionChangeActionId], entity, undefined, new REDirectionChangeCommand(Input.dir8));
            context.closeDialog(false); // 行動消費無しで close
        }
    }
}

