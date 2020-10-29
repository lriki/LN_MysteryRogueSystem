import { REDirectionChangeCommand, REMoveToAdjacentCommand } from "ts/commands/REDirectionChangeCommand";
import { REData } from "ts/data/REData";
import { REGame } from "ts/RE/REGame";
import { REDialogContext } from "../system/REDialog";
import { REDialogVisual } from "./REDialogVisual";

export class REManualActionDialogVisual extends REDialogVisual {

    onUpdate(context: REDialogContext) {
        const commandContext = context.commandContext();
        const entity = context.causeEntity();
        if (!entity) return;

        //if (Input.dir8 != 0 && Input.dir8 != entity.dir) {
        //    const commandContext = context.commandContext();
        //    commandContext.postAction(REData.actions[REData.DirectionChangeActionId], entity, undefined, new REDirectionChangeCommand(Input.dir8));
        //    context.closeDialog(false); // 行動消費無しで close
        //}

        
        let x = 0;
        let y = 0;
        let dir = Input.dir8;

        switch (Input.dir8) {
            case 1:
                x = -1;
                y = 1;
                break;
            case 2:
                y = 1;
                break;
            case 3:
                x = 1;
                y = 1;
                break;
            case 4:
                x = -1;
                break;
            case 6:
                x = 1;
                break;
            case 7:
                x = -1;
                y = -1;
                break;
            case 8:
                y = -1;
                break;
            case 9:
                x = 1;
                y = -1;
                break;
        }
        
        if (dir != 0 && REGame.map.checkPassage(entity, dir)) {
            if (dir != 0) {
                commandContext.postAction(REData.actions[REData.DirectionChangeActionId], entity, undefined, new REDirectionChangeCommand(dir));
            }
            commandContext.postAction(REData.actions[REData.MoveToAdjacentActionId], entity, undefined, new REMoveToAdjacentCommand(entity.x + x, entity.y + y));
            context.closeDialog(true);
            return;
        }

    }
}

