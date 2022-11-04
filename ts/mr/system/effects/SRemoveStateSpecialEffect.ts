import { DSpecialEffectRef } from "ts/mr/data/DSpecialEffect";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/LEntity";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

// 転ぶ (一般的な英語は fall だが、本システムとして fall はいろいろ使うので混乱を避けるため stumble にしてみる)
export class SRemoveStateSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        if (!data.dataId) return;

        let chance = data.value;
        if (cctx.random().nextIntWithMax(100) < (chance * 100)) {
            target.removeState(data.dataId);
            result.makeSuccess();
        }
        
        // target.removeStates(removeStateIds);
        // result.makeSuccess();

        // result.makeSuccess();

        // if (target.previewRejection(cctx, { kind: "EffectBehavior", id: data.specialEffectId })) {
        //     const activity = (new LActivity()).setup(MRBasics.actions.stumble, target);
        //     cctx.postActivity(activity);
        // }
      

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
