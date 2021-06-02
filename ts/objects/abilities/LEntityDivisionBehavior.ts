import { REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { SMovementCommon } from "ts/system/SMovementCommon";
import { LProjectableBehavior } from "../behaviors/activities/LProjectableBehavior";
import { CollideActionArgs, CommandArgs, LBehavior, onCollideAction, onDirectAttackDamaged } from "../behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";


export class LEntityDivisionBehavior extends LBehavior {
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LEntityDivisionBehavior);
        return b
    }

    [onDirectAttackDamaged](args: CommandArgs, context: SCommandContext): REResponse {
        const self = args.self;

        const selfBlock = REGame.map.block(self.x, self.y);

        // 有効な隣接 Block があり、その方向へ移動可能かを調べる
        const candidates = SMovementCommon.getAdjacentBlocks(self).filter(b => SMovementCommon.checkPassageBlockToBlock(self, selfBlock, b));
        if (candidates.length > 1) {
            const newBlock = candidates[context.random().nextIntWithMax(candidates.length)];
            const newEntity = self.clone();
            REGame.world._transferEntity(newEntity, self.floorId, newBlock.x(), newBlock.y());
        }
        else {
            // 周囲に空きが無いため分裂できない
        }

        return REResponse.Pass;
    }

}

