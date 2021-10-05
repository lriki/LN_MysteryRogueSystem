
import { DActionId } from "ts/re/data/DAction";
import { REBasics } from "ts/re/data/REBasics";
import { DBlockLayerKind } from "ts/re/data/DCommon";
import { CommandArgs, LBehavior, onProceedFloorReaction } from "ts/re/objects/behaviors/LBehavior";
import { SEventExecutionDialog } from "ts/re/system/dialogs/EventExecutionDialog";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";

/**
 */
export class LEntryPointBehavior extends LBehavior {
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LEntryPointBehavior);
        return b
    }

    queryHomeLayer(): DBlockLayerKind | undefined {
        return DBlockLayerKind.Ground;
    }

    onQueryReactions(actions: DActionId[]): void {
        actions.splice(0);
        actions.push(REBasics.actions.BackwardFloorActionId);
    }
    
    [onProceedFloorReaction](args: CommandArgs, context: SCommandContext): SCommandResponse {
        const entity = args.self;

        context.openDialog(entity, new SEventExecutionDialog(entity.rmmzEventId), false);

        return SCommandResponse.Handled;
    }
    
    
}
