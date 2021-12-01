import { tr2 } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { REData } from "ts/re/data/REData";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { LRandom } from "ts/re/objects/LRandom";
import { UName } from "ts/re/usecases/UName";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SEntityFactory } from "../SEntityFactory";
import { SSpecialEffect } from "./SSpecialEffect";
import { SItemStealSpecialEffect } from "./SItemStealSpecialEffect";
import { DSpecificEffectId } from "ts/re/data/DCommon";
import { LEffectResult } from "ts/re/objects/LEffectResult";
import { DSpecialEffectRef } from "ts/re/data/DEffect";

export class SGoldStealSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {

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

        const entity = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.system.fallbackGoldEntityId, []));
        entity.setActualParam(REBasics.params.gold, steal);

        inventory.gainGold(-steal);
        return entity;
    }
}
