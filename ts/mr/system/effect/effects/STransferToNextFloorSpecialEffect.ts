import { DSpecialEffectRef } from "ts/mr/data/DSpecialEffect";
import { DFloorClass } from "ts/mr/data/DLand";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { MRLively } from "ts/mr/lively/MRLively";
import { UTransfer } from "ts/mr/utility/UTransfer";
import { SCommandContext } from "../../SCommandContext";
import { SEffect } from "../../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class STransferToNextFloorSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffect, target: LEntity, result: LEffectResult): void {
        const land = MRLively.mapView.currentMap.land2();
        const currentFloorId = target.floorId;
        const newFloorNumber = currentFloorId.floorNumber + 1;

        if (1 <= newFloorNumber || newFloorNumber < land.maxFloorNumber()) {
            // 次のフロアへ
            if (target.isPlayer()) {
                UTransfer.proceedFloorForwardForPlayer(cctx);
            }
            else {
                const newFloorId = LFloorId.make(currentFloorId.landId, newFloorNumber);
                MRLively.world.transferEntity(target, newFloorId);
            }
            result.makeSuccess();
        }
        else {
            // 移動できない
        }


    }

}


