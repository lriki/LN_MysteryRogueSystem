import { DSpecialEffectRef } from "ts/mr/data/DSpecialEffect";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/LEntity";
import { MovingMethod } from "ts/mr/lively/LMap";
import { MRLively } from "ts/mr/lively/MRLively";
import { UMovement } from "ts/mr/utility/UMovement";
import { SCommandContext } from "../SCommandContext";
import { SEffect } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SDivisionSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffect, target: LEntity, result: LEffectResult): void {
        const block = MRLively.camera.currentMap.block(target.mx, target.my);

        result.makeSuccess();

        // 有効な隣接 Block があり、その方向へ移動可能かを調べる
        const candidates = UMovement.getAdjacentBlocks(target).filter(b => UMovement.checkPassageBlockToBlock(target, block, b, MovingMethod.Walk));
        if (candidates.length > 1) {
            const newBlock = candidates[cctx.random().nextIntWithMax(candidates.length)];
            const newEntity = target.clone();
            MRLively.world.transferEntity(cctx, newEntity, target.floorId, newBlock.mx, newBlock.my);

            cctx.postSequel(newEntity, MRBasics.sequels.MoveSequel).setStartPosition(target.mx, target.my);
            cctx.postWaitSequel();
        }
        else {
            // 周囲に空きが無いため分裂できない
        }
    }

}
