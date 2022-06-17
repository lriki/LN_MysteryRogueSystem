import { DSpecificEffectId } from "ts/re/data/DCommon";
import { DSpecialEffectRef } from "ts/re/data/DEffect";
import { MRBasics } from "ts/re/data/MRBasics";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LBattlerBehavior } from "ts/re/objects/behaviors/LBattlerBehavior";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEffectResult } from "ts/re/objects/LEffectResult";
import { LEntity } from "ts/re/objects/LEntity";
import { REGame } from "ts/re/objects/REGame";
import { UAction } from "ts/re/usecases/UAction";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

// 転ぶ (一般的な英語は fall だが、本システムとして fall はいろいろ使うので混乱を避けるため stumble にしてみる)
export class SStumbleSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {

        result.makeSuccess();

        if (target.previewRejection(cctx, { kind: "EffectBehavior", id: data.specialEffectId })) {
            const activity = (new LActivity()).setup(MRBasics.actions.stumble, target);
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
