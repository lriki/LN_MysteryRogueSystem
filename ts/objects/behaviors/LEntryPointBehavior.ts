
import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { LBehavior } from "ts/objects/behaviors/LBehavior";
import { BlockLayerKind } from "ts/objects/LBlockLayer";
import { RESystem } from "ts/system/RESystem";
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

    onQueryReactions(actions: DActionId[]): DActionId[] {
        return [DBasics.actions.BackwardFloorActionId];
    }
    
    /*
    [onProceedFloorReaction](args: CommandArgs, context: RECommandContext): REResponse {
        const entity = args.self;

        context.openDialog(entity, new REEventExecutionDialog(entity.rmmzEventId));

        return REResponse.Succeeded;
    }
    */
    
}
