import { REDirectionChangeArgs, REMoveToAdjacentArgs } from "ts/commands/RECommandArgs";
import { REData } from "ts/data/REData";
import { REGame } from "ts/RE/REGame";
import { REDialogContext } from "../system/REDialog";
import { REDialogVisual } from "./REDialogVisual";
import { Scene_Footing } from "./scenes/Scene_Footing";

export class REManualActionDialogVisual extends REDialogVisual {

    onUpdate(context: REDialogContext) {
        const commandContext = context.commandContext();
        const entity = context.causeEntity();
        if (!entity) return;

        if (entity.immediatelyAfterAdjacentMoving) {
            console.log("SceneManager.push(Scene_Footing)");
            SceneManager.push(Scene_Footing);
            return;
        }

        //if (Input.dir8 != 0 && Input.dir8 != entity.dir) {
        //    const commandContext = context.commandContext();
        //    commandContext.postAction(REData.actions[REData.DirectionChangeActionId], entity, undefined, new REDirectionChangeCommand(Input.dir8));
        //    context.closeDialog(false); // 行動消費無しで close
        //}
        let dir = Input.dir8;
        
        if (dir != 0 && REGame.map.checkPassage(entity, dir)) {
            if (dir != 0) {
                const args: REDirectionChangeArgs = { direction: dir };
                commandContext.postAction(REData.DirectionChangeActionId, entity, undefined, args);
            }
            const args: REMoveToAdjacentArgs = { direction: dir };
            commandContext.postAction(REData.MoveToAdjacentActionId, entity, undefined, args);
            context.closeDialog(true);
            return;
        }

    }
}

