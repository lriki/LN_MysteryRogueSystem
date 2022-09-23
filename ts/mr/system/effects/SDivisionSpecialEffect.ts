import { DSpecificEffectId } from "ts/mr/data/DCommon";
import { DSpecialEffectRef } from "ts/mr/data/DEffect";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LBattlerBehavior } from "ts/mr/lively/behaviors/LBattlerBehavior";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/LEntity";
import { MovingMethod } from "ts/mr/lively/LMap";
import { REGame } from "ts/mr/lively/REGame";
import { UAction } from "ts/mr/usecases/UAction";
import { UMovement } from "ts/mr/usecases/UMovement";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SDivisionSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        const block = REGame.map.block(target.mx, target.my);

        result.makeSuccess();

        // 有効な隣接 Block があり、その方向へ移動可能かを調べる
        const candidates = UMovement.getAdjacentBlocks(target).filter(b => UMovement.checkPassageBlockToBlock(target, block, b, MovingMethod.Walk));
        if (candidates.length > 1) {
            const newBlock = candidates[cctx.random().nextIntWithMax(candidates.length)];
            const newEntity = target.clone();
            REGame.world.transferEntity(newEntity, target.floorId, newBlock.mx, newBlock.my);

            cctx.postSequel(newEntity, MRBasics.sequels.MoveSequel).setStartPosition(target.mx, target.my);
            cctx.postWaitSequel();
        }
        else {
            // 周囲に空きが無いため分裂できない
        }
    }

}
