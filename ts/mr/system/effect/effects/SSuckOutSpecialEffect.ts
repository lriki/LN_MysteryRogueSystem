import { DSpecialEffectRef } from "ts/mr/data/DSpecialEffect";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { UAction } from "ts/mr/utility/UAction";
import { SCommandContext } from "../../SCommandContext";
import { SEffect } from "../../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";
import { TDrop } from "ts/mr/transactions/TDrop";
import { tr2 } from "ts/mr/Common";
import { UName } from "ts/mr/utility/UName";

export class SSuckOutSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffect, target: LEntity, result: LEffectResult): void {
        const t = TDrop.makeFromEntityInventory(target)
            .withLocation(performer.mx, performer.my);

        if (t.testValidEffect()) {
            // 処理前の容量でメッセージを作っておく
            const message = tr2("%1からアイテムを取り出した。").format(UName.makeNameAsItem(target));
            
            t.performe(cctx);

            cctx.postMessage(message);
        }
        
        result.makeSuccess();
    }

}
