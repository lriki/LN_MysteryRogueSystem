import { DSpecificEffectId } from "ts/re/data/DCommon";
import { DSpecialEffectRef } from "ts/re/data/DEffect";
import { REData } from "ts/re/data/REData";
import { LBattlerBehavior } from "ts/re/objects/behaviors/LBattlerBehavior";
import { LEffectResult } from "ts/re/objects/LEffectResult";
import { LEntity } from "ts/re/objects/LEntity";
import { REGame } from "ts/re/objects/REGame";
import { UAction } from "ts/re/usecases/UAction";
import { USpawner } from "ts/re/usecases/USpawner";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SChangeInstanceSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        const entityData = (() => {
            if (data.entityId)
                return REData.entities[data.entityId];
            else
                return cctx.random().select(USpawner.getEnemiesFromSpawnTable(target.floorId));
        })();

        const prevIsUnit = target.isUnit();

        target.setupInstance(entityData.id);

        if (prevIsUnit) {
            REGame.scheduler.resetEntity(target);
        }
    }

}
