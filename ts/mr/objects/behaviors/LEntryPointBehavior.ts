
import { MRBasics } from "ts/mr/data/MRBasics";
import { DActionId, DBlockLayerKind } from "ts/mr/data/DCommon";
import { CommandArgs, LBehavior, onProceedFloorReaction } from "ts/mr/objects/behaviors/LBehavior";
import { SEventExecutionDialog } from "ts/mr/system/dialogs/SEventExecutionDialog";
import { SCommandResponse } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { MRSerializable } from "ts/mr/Common";
import { LReaction } from "../LCommon";

/**
 */
@MRSerializable
export class LEntryPointBehavior extends LBehavior {
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LEntryPointBehavior);
        return b;
    }

    queryHomeLayer(): DBlockLayerKind | undefined {
        return DBlockLayerKind.Ground;
    }

    onQueryReactions(self: LEntity, reactions: LReaction[]): void {
        reactions.splice(0);
        reactions.push({ actionId: MRBasics.actions.BackwardFloorActionId });
    }
    
    [onProceedFloorReaction](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
        const entity = args.self;

        cctx.openDialog(entity, new SEventExecutionDialog(entity.rmmzEventId, entity), false);

        return SCommandResponse.Handled;
    }
    
    
}
