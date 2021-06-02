
import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { LBehavior } from "ts/objects/behaviors/LBehavior";
import { BlockLayerKind } from "ts/objects/LBlock";
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
