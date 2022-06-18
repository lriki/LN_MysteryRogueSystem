import { tr2 } from "ts/mr/Common";
import { DSpecificEffectId } from "ts/mr/data/DCommon";
import { DSpecialEffectRef } from "ts/mr/data/DEffect";
import { DLandForwardDirection } from "ts/mr/data/DLand";
import { LBattlerBehavior } from "ts/mr/objects/behaviors/LBattlerBehavior";
import { LEffectResult } from "ts/mr/objects/LEffectResult";
import { LEntity } from "ts/mr/objects/LEntity";
import { LFloorId } from "ts/mr/objects/LFloorId";
import { REGame } from "ts/mr/objects/REGame";
import { UAction } from "ts/mr/usecases/UAction";
import { UTransfer } from "ts/mr/usecases/UTransfer";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class STransferToLowerFloorSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        const land = REGame.map.land2();
        const landData = land.landData();

        // Flat land では処理不要
        if (landData.forwardDirection == DLandForwardDirection.Flat) return;

        const currentFloorId = target.floorId;
        const newFloorNumber = currentFloorId.floorNumber() + ((landData.forwardDirection == DLandForwardDirection.Downhill) ? 1 : -1);

        if (1 <= newFloorNumber && newFloorNumber < land.maxFloorNumber()) {
            // 次のフロアへ
            if (target.isPlayer()) {
                UTransfer.proceedFloorForwardForPlayer();
            }
            else {
                const newFloorId = LFloorId.make(currentFloorId.landId(), newFloorNumber);
                REGame.world.transferEntity(target, newFloorId);
            }
            result.makeSuccess();
        }
        else {
            // 移動できない
        }
    }

}