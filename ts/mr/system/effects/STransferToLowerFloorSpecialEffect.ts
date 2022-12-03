import { DSpecialEffectRef } from "ts/mr/data/DSpecialEffect";
import { DFloorClass, DLandForwardDirection } from "ts/mr/data/DLand";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/LEntity";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { MRLively } from "ts/mr/lively/MRLively";
import { UTransfer } from "ts/mr/utility/UTransfer";
import { SCommandContext } from "../SCommandContext";
import { SEffect } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class STransferToLowerFloorSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffect, target: LEntity, result: LEffectResult): void {
        const land = MRLively.camera.currentMap.land2();
        const landData = land.landData();

        // Flat land では処理不要
        if (landData.forwardDirection == DLandForwardDirection.Flat) return;

        const currentFloorId = target.floorId;
        const newFloorNumber = currentFloorId.floorNumber() + ((landData.forwardDirection == DLandForwardDirection.Downhill) ? 1 : -1);

        if (1 <= newFloorNumber && newFloorNumber < land.maxFloorNumber()) {
            // 次のフロアへ
            if (target.isPlayer()) {
                UTransfer.proceedFloorForwardForPlayer(cctx);
            }
            else {
                const newFloorId = LFloorId.make(currentFloorId.landId(), DFloorClass.EventMap, newFloorNumber);
                MRLively.world.transferEntity(cctx, target, newFloorId);
            }
            result.makeSuccess();
        }
        else {
            // 移動できない
        }
    }

}