import { DEffectBehaviorId } from "ts/re/data/DCommon";
import { REBasics } from "ts/re/data/REBasics";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LBattlerBehavior } from "ts/re/objects/behaviors/LBattlerBehavior";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { REGame } from "ts/re/objects/REGame";
import { UAction } from "ts/re/usecases/UAction";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SEffectBehavior } from "./SEffectBehavior";

// 転ぶ (一般的な英語は fall だが、本システムとして fall はいろいろ使うので混乱を避けるため stumble にしてみる)
export class SStumbleEffectBehavior extends SEffectBehavior {

    public onApplyTargetEffect(cctx: SCommandContext, id: DEffectBehaviorId, performer: LEntity, modifier: SEffectModifier, target: LEntity): void {

        if (target.previewEffectBehaviorReaction(cctx, id)) {
            const activity = (new LActivity()).setup(REBasics.actions.stumble, target);
            cctx.postActivity(activity);
        }
      

        // const inventory = target.findEntityBehavior(LInventoryBehavior);
        // if (inventory) {
        //     const item = inventory.getDefenselessItems()[0];

        //     // TODO: 地形などを考慮して、本当に落とすアイテムを決める
        //     const dropItems = [item];

        //     for (const item of dropItems) {
        //         inventory.removeEntity(item);

        //         //REGame.world._transferEntity(item, REGame.map.floorId(), mx, my);
        //     }

        // }
    }

}
