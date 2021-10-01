import { tr2 } from "ts/re/Common";
import { DBasics } from "ts/re/data/DBasics";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LItemBehavior } from "ts/re/objects/behaviors/LItemBehavior";
import { LItemThiefBehavior } from "ts/re/objects/behaviors/LItemThiefBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { LRandom } from "ts/re/objects/LRandom";
import { UAction } from "ts/re/usecases/UAction";
import { UName } from "ts/re/usecases/UName";
import { USearch } from "ts/re/usecases/USearch";
import { Context } from "typedoc/dist/lib/converter";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { STextManager } from "../STextManager";
import { SEffectBehavior } from "./SEffectBehavior";
import { SItemStealSkillBehavior } from "./SItemStealEffectBehavior";

export class SGoldStealEffectBehavior extends SEffectBehavior {

    public onApplyTargetEffect(cctx: SCommandContext, performer: LEntity, modifier: SEffectModifier, target: LEntity): void {

        const gold = this.pickGold(target, cctx.random());
        if (gold <= 0) {
            cctx.postMessage(tr2("なにも盗めなかった。"));
            return;
        }

        const inventory = performer.getEntityBehavior(LInventoryBehavior);
        inventory.gainGold(gold);

        SItemStealSkillBehavior.postWarpBySteal(cctx, performer, gold.toString() + STextManager.currencyUnit);
    }

    private pickGold(target: LEntity, rand: LRandom): number {
        const inventory = target.findEntityBehavior(LInventoryBehavior);
        if (!inventory) return 0;
        
        const gold = inventory.gold();
        if (gold <= 0) return 0;

        const damage = 1000;
        const steal = Math.min(damage, gold);

        inventory.gainGold(-steal);
        return steal;
    }
}
