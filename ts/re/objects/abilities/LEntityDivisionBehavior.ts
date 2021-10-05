import { REBasics } from "ts/re/data/REBasics";
import { SCommandResponse } from "ts/re/system/RECommand";
import { RESystem } from "ts/re/system/RESystem";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { UMovement } from "ts/re/usecases/UMovement";
import { LBattlerBehavior } from "../behaviors/LBattlerBehavior";
import { CommandArgs, LBehavior, onDirectAttackDamaged } from "../behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { MovingMethod } from "../LMap";
import { REGame } from "../REGame";


export class LEntityDivisionBehavior extends LBehavior {
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LEntityDivisionBehavior);
        return b
    }

    [onDirectAttackDamaged](args: CommandArgs, context: SCommandContext): SCommandResponse {
        const self = args.self;
        const battler = self.getEntityBehavior(LBattlerBehavior);
        if (self.isDeathStateAffected()) return SCommandResponse.Pass;

        const selfBlock = REGame.map.block(self.x, self.y);

        // 有効な隣接 Block があり、その方向へ移動可能かを調べる
        const candidates = UMovement.getAdjacentBlocks(self).filter(b => UMovement.checkPassageBlockToBlock(self, selfBlock, b, MovingMethod.Walk));
        if (candidates.length > 1) {
            const newBlock = candidates[context.random().nextIntWithMax(candidates.length)];
            const newEntity = self.clone();
            REGame.world._transferEntity(newEntity, self.floorId, newBlock.x(), newBlock.y());

            context.postSequel(newEntity, REBasics.sequels.MoveSequel).setStartPosition(self.x, self.y);
            context.postWaitSequel();
        }
        else {
            // 周囲に空きが無いため分裂できない
        }

        return SCommandResponse.Pass;
    }

}

