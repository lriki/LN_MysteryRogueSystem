import { tr2 } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { MRData } from "ts/mr/data/MRData";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LEntity } from "ts/mr/lively/LEntity";
import { LRandom } from "ts/mr/lively/LRandom";
import { UName } from "ts/mr/utility/UName";
import { SCommandContext } from "../SCommandContext";
import { SEffect } from "../SEffectApplyer";
import { SEntityFactory } from "../SEntityFactory";
import { SSpecialEffect } from "./SSpecialEffect";
import { SItemStealSpecialEffect } from "./SItemStealSpecialEffect";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { DSpecialEffectRef } from "ts/mr/data/DSpecialEffect";

export class SGoldStealSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffect, target: LEntity, result: LEffectResult): void {

        const gold = this.pickGold(target, cctx.random());
        if (!gold) {
            cctx.postMessage(tr2("なにも盗めなかった。"));
            return;
        }

        const inventory = performer.getEntityBehavior(LInventoryBehavior);
        inventory.addEntity(gold);

        SItemStealSpecialEffect.postWarpBySteal(cctx, performer, UName.makeNameAsItem(gold));
    }

    private pickGold(target: LEntity, rand: LRandom): LEntity | undefined {
        const inventory = target.findEntityBehavior(LInventoryBehavior);
        if (!inventory) return undefined;
        
        const gold = inventory.gold();
        if (gold <= 0) return undefined;

        const damage = 1000;    // TODO:
        const steal = Math.min(damage, gold);

        const entity = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.system.fallbackGoldEntityId, []));
        entity.setParamCurrentValue(MRBasics.params.gold, steal);

        inventory.gainGold(-steal);
        return entity;
    }
}
