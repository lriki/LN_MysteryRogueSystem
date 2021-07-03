import { REResponse } from "ts/system/RECommand";
import { RESystem } from "ts/system/RESystem";
import { SCommandContext } from "ts/system/SCommandContext";
import { UMovement } from "ts/usecases/UMovement";
import { LProjectableBehavior } from "../behaviors/activities/LProjectableBehavior";
import { LBattlerBehavior } from "../behaviors/LBattlerBehavior";
import { CollideActionArgs, CommandArgs, LBehavior, onCollideAction, onDirectAttackDamaged } from "../behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { MovingMethod } from "../LMap";
import { REGame } from "../REGame";


export class LEntityDivisionBehavior extends LBehavior {
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LEntityDivisionBehavior);
        return b
    }

    [onDirectAttackDamaged](args: CommandArgs, context: SCommandContext): REResponse {
        const self = args.self;
        const battler = self.getBehavior(LBattlerBehavior);
        if (battler.isDeathStateAffected()) return REResponse.Pass;

        const selfBlock = REGame.map.block(self.x, self.y);

        // 有効な隣接 Block があり、その方向へ移動可能かを調べる
        const candidates = UMovement.getAdjacentBlocks(self).filter(b => UMovement.checkPassageBlockToBlock(self, selfBlock, b, MovingMethod.Walk));
        if (candidates.length > 1) {
            const newBlock = candidates[context.random().nextIntWithMax(candidates.length)];
            const newEntity = self.clone();
            console.log("clone");
            REGame.world._transferEntity(newEntity, self.floorId, newBlock.x(), newBlock.y());

            context.postSequel(newEntity, RESystem.sequels.MoveSequel).setStartPosition(self.x, self.y);
            context.postWaitSequel();
        }
        else {
            // 周囲に空きが無いため分裂できない
        }

        return REResponse.Pass;
    }

}

