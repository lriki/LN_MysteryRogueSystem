import { tr2 } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
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
import { SEffectBehavior } from "./SEffectBehavior";

export class SItemStealSkillBehavior extends SEffectBehavior {

    public onApplyTargetEffect(cctx: SCommandContext, performer: LEntity, modifier: SEffectModifier, target: LEntity): void {

        // TODO: これだとアイテム化けに対応できない
        if (target.findEntityBehavior(LItemBehavior)) {
            const inventory = performer.getEntityBehavior(LInventoryBehavior);
            // TODO: 取得可否判定は行うが、通常の「拾う」とは違う。メッセージは表示したくないし、ゴールドを盗んだ時はアイテムとしてインベントリに入れたい。
            UAction.postPickItem(cctx, performer, inventory, target)
                .then(() => {
                    SItemStealSkillBehavior.postWarpBySteal(cctx, performer, UName.makeNameAsItem(target));
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
    
    
            SItemStealSkillBehavior.postWarpBySteal(cctx, performer, UName.makeNameAsItem(item));
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
        cctx.postSequel(performer, REBasics.sequels.warp);

        const block = USearch.selectUnitSpawnableBlock(cctx.random());
        if (block) {
            cctx.postTransferFloor(performer, performer.floorId, block.x(), block.y());
        }
        else {
            throw new Error("Not implemented.");
        }
    }
}
