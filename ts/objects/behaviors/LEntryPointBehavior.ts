
import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { CommandArgs, LBehavior, onProceedFloorReaction } from "ts/objects/behaviors/LBehavior";
import { BlockLayerKind } from "ts/objects/LBlockLayer";
import { SEventExecutionDialog } from "ts/system/dialogs/EventExecutionDialog";
import { REResponse } from "ts/system/RECommand";
import { RESystem } from "ts/system/RESystem";
import { SCommandContext } from "ts/system/SCommandContext";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";

/**
 */
export class LEntryPointBehavior extends LBehavior {
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LEntryPointBehavior);
        return b
    }

    queryHomeLayer(): BlockLayerKind | undefined {
        return BlockLayerKind.Ground;
    }

    onQueryReactions(actions: DActionId[]): void {
        actions.splice(0);
        actions.push(DBasics.actions.BackwardFloorActionId);
    }
    
    [onProceedFloorReaction](args: CommandArgs, context: SCommandContext): REResponse {
        const entity = args.self;

        context.openDialog(entity, new SEventExecutionDialog(entity.rmmzEventId), false);

        return REResponse.Succeeded;
    }
    
    
}
