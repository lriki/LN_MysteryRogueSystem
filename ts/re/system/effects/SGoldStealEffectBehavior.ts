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
import { SEffectBehavior } from "./SEffectBehavior";
import { SItemStealSkillBehavior } from "./SItemStealEffectBehavior";
import { DEffectBehaviorId } from "ts/re/data/DCommon";

export class SGoldStealEffectBehavior extends SEffectBehavior {

    public onApplyTargetEffect(cctx: SCommandContext, id: DEffectBehaviorId, performer: LEntity, modifier: SEffectModifier, target: LEntity): void {

        const gold = this.pickGold(target, cctx.random());
        if (!gold) {
            cctx.postMessage(tr2("なにも盗めなかった。"));
            return;
        }

        const inventory = performer.getEntityBehavior(LInventoryBehavior);
        inventory.addEntity(gold);

        SItemStealSkillBehavior.postWarpBySteal(cctx, performer, UName.makeNameAsItem(gold));
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
