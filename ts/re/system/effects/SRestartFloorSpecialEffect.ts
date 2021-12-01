import { assert } from "ts/re/Common";
import { DSpecificEffectId } from "ts/re/data/DCommon";
import { DSpecialEffectRef } from "ts/re/data/DEffect";
import { LBattlerBehavior } from "ts/re/objects/behaviors/LBattlerBehavior";
import { LEffectResult } from "ts/re/objects/LEffectResult";
import { LEntity } from "ts/re/objects/LEntity";
import { UAction } from "ts/re/usecases/UAction";
import { RESystem } from "../RESystem";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SRestartFloorSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        assert(item);
        // セーブデータをロードするので、GameObject 全部作り直すことになる。
        // Effect 適用処理はこの関数の後もまだ続くので、ここでロードをしてしまうと危ない。
        // なので実行を予約しておく。
        RESystem.requestedRestartFloorItem = item.entityId();
        result.makeSuccess();
    }

}
