import { DSpecificEffectId } from "ts/mr/data/DCommon";
import { DSpecialEffectRef } from "ts/mr/data/DEffect";
import { MRData } from "ts/mr/data/MRData";
import { LBattlerBehavior } from "ts/mr/objects/behaviors/LBattlerBehavior";
import { LEffectResult } from "ts/mr/objects/LEffectResult";
import { LEntity } from "ts/mr/objects/LEntity";
import { REGame } from "ts/mr/objects/REGame";
import { UAction } from "ts/mr/usecases/UAction";
import { USpawner } from "ts/mr/usecases/USpawner";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SChangeInstanceSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        const entityData = (() => {
            if (data.entityId)
                return MRData.entities[data.entityId];
            else
                return cctx.random().select(USpawner.getEnemiesFromSpawnTable(target.floorId));
        })();

        const prevIsUnit = target.isUnit();

        target.setupInstance(entityData.id);
        result.makeSuccess();

        if (prevIsUnit) {
            REGame.scheduler.resetEntity(target);
        }
    }

}
