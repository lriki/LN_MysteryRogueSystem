import { tr2 } from "ts/re/Common";
import { DSpecificEffectId } from "ts/re/data/DCommon";
import { DSpecialEffectRef } from "ts/re/data/DEffect";
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

export class STransferToNextFloorSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        const land = REGame.map.land2();
        const currentFloorId = target.floorId;
        const newFloorNumber = currentFloorId.floorNumber() + 1;

        if (1 <= newFloorNumber || newFloorNumber < land.maxFloorNumber()) {
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


