import { tr2 } from "ts/re/Common";
import { DSpecificEffectId } from "ts/re/data/DCommon";
import { DSpecialEffectRef } from "ts/re/data/DEffect";
import { REBasics } from "ts/re/data/REBasics";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LItemBehavior } from "ts/re/objects/behaviors/LItemBehavior";
import { LItemThiefBehavior } from "ts/re/objects/behaviors/LItemThiefBehavior";
import { LEffectResult } from "ts/re/objects/LEffectResult";
import { LEntity } from "ts/re/objects/LEntity";
import { LRandom } from "ts/re/objects/LRandom";
import { UAction } from "ts/re/usecases/UAction";
import { UName } from "ts/re/usecases/UName";
import { USearch } from "ts/re/usecases/USearch";
import { Context } from "typedoc/dist/lib/converter";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SItemStealSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {

        // TODO: これだとアイテム化けに対応できない
        //if (target.findEntityBehavior(LItemBehavior)) {
        if (USearch.isNeutralItem(target)) {
            const inventory = performer.getEntityBehavior(LInventoryBehavior);
            // TODO: 取得可否判定は行うが、通常の「拾う」とは違う。メッセージは表示したくないし、ゴールドを盗んだ時はアイテムとしてインベントリに入れたい。
            UAction.postPickItem(cctx, performer, inventory, target)
                .then(() => {
                    SItemStealSpecialEffect.postWarpBySteal(cctx, performer, UName.makeNameAsItem(target));
                    return true;
                });
        }
        else {
            const item = this.pickItem(target, cctx.random());
            if (!item) {
                cctx.postMessage(tr2("なにも盗めなかった。"));
                return;
            }
    
            const inventory = performer.getEntityBehavior(LInventoryBehavior);
            inventory.addEntity(item);
    
    
            SItemStealSpecialEffect.postWarpBySteal(cctx, performer, UName.makeNameAsItem(item));
        }
    }

    private pickItem(target: LEntity, rand: LRandom): LEntity | undefined {
        const inventory = target.findEntityBehavior(LInventoryBehavior);
        if (!inventory) return undefined;
        
        const items = inventory.entities();
        if (items.length == 0) return undefined;

        const item = rand.select(items);
        inventory.removeEntity(item);
        return item;
    }

    public static postWarpBySteal(cctx: SCommandContext, performer: LEntity, itemName: string): void {
        cctx.postMessage(tr2("%1は%2を盗んだ！").format(UName.makeUnitName(performer), itemName));
        UAction.postWarp(cctx, performer);
    }
}
