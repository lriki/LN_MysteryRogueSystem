import { assert } from "ts/mr/Common";
import { DSpecialEffectRef } from "ts/mr/data/DSpecialEffect";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { MRSystem } from "../MRSystem";
import { SCommandContext } from "../SCommandContext";
import { SEffect } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SRestartFloorSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffect, target: LEntity, result: LEffectResult): void {
        assert(item);
        // セーブデータをロードするので、GameObject 全部作り直すことになる。
        // Effect 適用処理はこの関数の後もまだ続くので、ここでロードをしてしまうと危ない。
        // なので実行を予約しておく。
        MRSystem.requestedRestartFloorItem = item.entityId();
        result.makeSuccess();
    }

}
