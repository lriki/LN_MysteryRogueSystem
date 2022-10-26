import { DSpecificEffectId } from "ts/mr/data/DCommon";
import { DSpecialEffectRef } from "ts/mr/data/DEffect";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LBattlerBehavior } from "ts/mr/lively/behaviors/LBattlerBehavior";
import { LExperienceBehavior } from "ts/mr/lively/behaviors/LExperienceBehavior";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/LEntity";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SSpecialEffect } from "./SSpecialEffect";

export class SLevelDownSpecialEffect extends SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        const param = target.params.param(MRBasics.params.level);
        if (!param) return;

        const experience = target.findEntityBehavior(LExperienceBehavior);
        if (!experience) return;

        // refresh は ApplyEffect の最後で行いたいので、ここでは直接設定のみ行う
        const level = target.getEffortValue(MRBasics.params.level);
        if (level > 1) {
            // レベル減算
            target.setEffortValue(MRBasics.params.level, level - 1);
        
            // 次のレベルアップまでに必要な経験値をあと 1 の状態にする。
            // NOTE: ここでやるべきか、 LExperienceBehavior 側でやるべきか悩ましいところだけど、
            //       コアスクリプトではレベルダウン時のこのような調整処理はサポートしていない。
            //       またもし LExperienceBehavior でやるなら、レベル増減の「原因」を onParamChanged まで通知しなければならず、複雑になる。
            experience.setExp(target, experience.nextLevelExp(target) - 1);

            result.leveldown = true;
            result.makeSuccess();
        }
    }
}
