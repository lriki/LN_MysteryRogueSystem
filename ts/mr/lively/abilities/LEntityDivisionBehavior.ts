import { MRBasics } from "ts/mr/data/MRBasics";
import { SCommandResponse } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { UMovement } from "ts/mr/utility/UMovement";
import { LBattlerBehavior } from "../behaviors/LBattlerBehavior";
import { CommandArgs, LBehavior, onDirectAttackDamaged } from "../behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { MovingMethod } from "../LMap";
import { MRLively } from "../MRLively";
import { MRSerializable } from "ts/mr/Common";
import { HMovement } from "../helpers/HMovement";

/** @deprecated TODO: カウンターアクションとして、"分裂" スキルを発動するようにしたい */
@MRSerializable
export class LEntityDivisionBehavior extends LBehavior {
    
    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LEntityDivisionBehavior);
        return b;
    }

    [onDirectAttackDamaged](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
        const self = args.self;
        const battler = self.getEntityBehavior(LBattlerBehavior);
        if (self.isDeathStateAffected()) return SCommandResponse.Pass;

        const selfBlock = MRLively.mapView.currentMap.block(self.mx, self.my);

        // 有効な隣接 Block があり、その方向へ移動可能かを調べる
        const candidates = UMovement.getAdjacentBlocks(self).filter(b => HMovement.checkPassageBlockToBlock(self, selfBlock, b, MovingMethod.Walk));
        if (candidates.length > 1) {
            const newBlock = candidates[cctx.random().nextIntWithMax(candidates.length)];
            const newEntity = self.clone();
            MRLively.world.transferEntity(newEntity, self.floorId, newBlock.mx, newBlock.my);

            cctx.postSequel(newEntity, MRBasics.sequels.MoveSequel).setStartPosition(self.mx, self.my);
            cctx.postWaitSequel();
        }
        else {
            // 周囲に空きが無いため分裂できない
        }

        return SCommandResponse.Pass;
    }

}

