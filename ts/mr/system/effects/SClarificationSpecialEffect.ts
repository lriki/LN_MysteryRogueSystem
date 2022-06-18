import { DSpecificEffectId } from "ts/mr/data/DCommon";
import { DSpecialEffectRef } from "ts/mr/data/DEffect";
import { DClarificationType } from "ts/mr/data/MRBasics";
import { LBattlerBehavior } from "ts/mr/objects/behaviors/LBattlerBehavior";
import { LEffectResult } from "ts/mr/objects/LEffectResult";
import { LEntity } from "ts/mr/objects/LEntity";
import { REGame } from "ts/mr/objects/REGame";
import { UAction } from "ts/mr/usecases/UAction";
import { RESystem } from "../RESystem";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SClarificationSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        const map = REGame.map;

        cctx.postCall(() => {
            switch (data.value) {
                case DClarificationType.Unit:
                    map.unitClarity = true;
                    RESystem.minimapData.setRefreshNeeded();
                    break;
                case DClarificationType.Item:
                    map.itemClarity = true;
                    RESystem.minimapData.setRefreshNeeded();
                    break;
                case DClarificationType.Trap:
                    map.trapClarity = true;
                    RESystem.minimapData.setRefreshNeeded();
                    break;
                case DClarificationType.Terrain:
                    REGame.map.blocks().forEach(b => b._passed = true);
                    RESystem.minimapData.setRefreshNeeded();
                    break;
                case DClarificationType.Sight:
                    map.sightClarity = true;
                    RESystem.minimapData.setRefreshNeeded();
                    break;
                default:
                    throw new Error("Unreachable.");
            }
        });
        result.makeSuccess();
    }
}
