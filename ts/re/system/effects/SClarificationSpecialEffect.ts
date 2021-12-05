import { DSpecificEffectId } from "ts/re/data/DCommon";
import { DSpecialEffectRef } from "ts/re/data/DEffect";
import { DClarificationType } from "ts/re/data/REBasics";
import { LBattlerBehavior } from "ts/re/objects/behaviors/LBattlerBehavior";
import { LEffectResult } from "ts/re/objects/LEffectResult";
import { LEntity } from "ts/re/objects/LEntity";
import { REGame } from "ts/re/objects/REGame";
import { UAction } from "ts/re/usecases/UAction";
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
                case DClarificationType.Terrain:
                    REGame.map.blocks().forEach(b => b._passed = true);
                    RESystem.minimapData.setRefreshNeeded();
                    break;
                default:
                    throw new Error("Unreachable.");
            }
        });
        result.makeSuccess();
    }
}
