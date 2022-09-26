import { tr2 } from "ts/mr/Common";
import { DSpecialEffectRef } from "ts/mr/data/DEffect";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/LEntity";
import { LRandom } from "ts/mr/lively/LRandom";
import { UAction } from "ts/mr/utility/UAction";
import { UName } from "ts/mr/utility/UName";
import { USearch } from "ts/mr/utility/USearch";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SItemStealSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        result.makeSuccess();

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
        
        let items = inventory.items;
        if (items.length == 0) return undefined;

        // 装備中のアイテムは除外
        const equipmentUser = target.findEntityBehavior(LEquipmentUserBehavior);
        if (equipmentUser) {
            items = items.filter(x => !equipmentUser.isEquipped(x) && !equipmentUser.isShortcutEquipped(x));
        }
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
