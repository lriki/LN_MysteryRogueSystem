
import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { CommandArgs, LBehavior, onProceedFloorReaction } from "ts/objects/behaviors/LBehavior";
import { BlockLayerKind } from "ts/objects/REGame_Block";
import { LEntity } from "ts/objects/LEntity";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { RESystem } from "ts/system/RESystem";
import { REEventExecutionDialog } from "ts/dialogs/EventExecutionDialog";

/**
 */
export class LEntryPointBehavior extends LBehavior {
    onQueryProperty(propertyId: number): any {
        if (propertyId == RESystem.properties.homeLayer)
            return BlockLayerKind.Ground;
        else
            super.onQueryProperty(propertyId);
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
