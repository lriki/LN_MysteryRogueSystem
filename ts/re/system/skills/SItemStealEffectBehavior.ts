import { tr2 } from "ts/re/Common";
import { DBasics } from "ts/re/data/DBasics";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { LRandom } from "ts/re/objects/LRandom";
import { UName } from "ts/re/usecases/UName";
import { USearch } from "ts/re/usecases/USearch";
import { Context } from "typedoc/dist/lib/converter";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SEffectBehavior } from "./SEffectBehavior";

export class SItemStealSkillBehavior extends SEffectBehavior {

    public onApplyTargetEffect(cctx: SCommandContext, performer: LEntity, modifier: SEffectModifier, target: LEntity): void {

        const item = this.pickItem(target, cctx.random());
        if (!item) {
            cctx.postMessage(tr2("なにも盗めなかった。"));
            return;
        }

        const inventory = performer.getEntityBehavior(LInventoryBehavior);
        inventory.addEntity(item);


        
        cctx.postMessage(tr2("%1は%2を盗んだ！").format(UName.makeUnitName(performer), UName.makeNameAsItem(item)));

        cctx.postSequel(performer, DBasics.sequels.warp);

        const block = USearch.selectUnitSpawnableBlock(cctx.random());
        if (block) {
            cctx.postTransferFloor(performer, performer.floorId, block.x(), block.y());
        }
        else {
            throw new Error("Not implemented.");
        }
    }

    public pickItem(target: LEntity, rand: LRandom): LEntity | undefined {
        const inventory = target.findEntityBehavior(LInventoryBehavior);
        if (!inventory) return undefined;
        
        const items = inventory.entities();
        if (items.length == 0) return undefined;

        const item = rand.select(items);
        inventory.removeEntity(item);
        return item;
    }
}
