import { DSpecialEffectRef } from "ts/mr/data/DSpecialEffect";
import { DClarificationType } from "ts/mr/data/MRBasics";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/LEntity";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "../MRSystem";
import { SCommandContext } from "../SCommandContext";
import { SEffect } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SClarificationSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffect, target: LEntity, result: LEffectResult): void {
        const map = MRLively.map;

        cctx.postCall(() => {
            switch (data.value) {
                case DClarificationType.Unit:
                    map.unitClarity = true;
                    MRSystem.minimapData.setRefreshNeeded();
                    break;
                case DClarificationType.Item:
                    map.itemClarity = true;
                    MRSystem.minimapData.setRefreshNeeded();
                    break;
                case DClarificationType.Trap:
                    map.trapClarity = true;
                    MRSystem.minimapData.setRefreshNeeded();
                    break;
                case DClarificationType.Terrain:
                    MRLively.map.blocks().forEach(b => b._passed = true);
                    MRSystem.minimapData.setRefreshNeeded();
                    break;
                case DClarificationType.Sight:
                    map.sightClarity = true;
                    MRSystem.minimapData.setRefreshNeeded();
                    break;
                default:
                    throw new Error("Unreachable.");
            }
        });
        result.makeSuccess();
    }
}
