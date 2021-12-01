import { tr2 } from "ts/re/Common";
import { DSpecificEffectId } from "ts/re/data/DCommon";
import { DSpecialEffectRef } from "ts/re/data/DEffect";
import { DLandForwardDirection } from "ts/re/data/DLand";
import { LBattlerBehavior } from "ts/re/objects/behaviors/LBattlerBehavior";
import { LEffectResult } from "ts/re/objects/LEffectResult";
import { LEntity } from "ts/re/objects/LEntity";
import { LFloorId } from "ts/re/objects/LFloorId";
import { REGame } from "ts/re/objects/REGame";
import { UAction } from "ts/re/usecases/UAction";
import { UTransfer } from "ts/re/usecases/UTransfer";
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
                REGame.world._transferEntity(target, newFloorId);
            }
            result.makeSuccess();
        }
        else {
            // 移動できない
        }
    }

}