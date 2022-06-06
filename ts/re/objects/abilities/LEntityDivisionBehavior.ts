import { REBasics } from "ts/re/data/REBasics";
import { SCommandResponse } from "ts/re/system/SCommand";
import { RESystem } from "ts/re/system/RESystem";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { UMovement } from "ts/re/usecases/UMovement";
import { LBattlerBehavior } from "../behaviors/LBattlerBehavior";
import { CommandArgs, LBehavior, onDirectAttackDamaged } from "../behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { MovingMethod } from "../LMap";
import { REGame } from "../REGame";

/** @deprecated TODO: カウンターアクションとして、"分裂" スキルを発動するようにしたい */
export class LEntityDivisionBehavior extends LBehavior {
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LEntityDivisionBehavior);
        return b
    }

    [onDirectAttackDamaged](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
        const self = args.self;
        const battler = self.getEntityBehavior(LBattlerBehavior);
        if (self.isDeathStateAffected()) return SCommandResponse.Pass;

        const selfBlock = REGame.map.block(self.mx, self.my);

        // 有効な隣接 Block があり、その方向へ移動可能かを調べる
        const candidates = UMovement.getAdjacentBlocks(self).filter(b => UMovement.checkPassageBlockToBlock(self, selfBlock, b, MovingMethod.Walk));
        if (candidates.length > 1) {
            const newBlock = candidates[cctx.random().nextIntWithMax(candidates.length)];
            const newEntity = self.clone();
            REGame.world.transferEntity(newEntity, self.floorId, newBlock.mx, newBlock.my);

            cctx.postSequel(newEntity, REBasics.sequels.MoveSequel).setStartPosition(self.mx, self.my);
            cctx.postWaitSequel();
        }
        else {
            // 周囲に空きが無いため分裂できない
        }

        return SCommandResponse.Pass;
    }

}

