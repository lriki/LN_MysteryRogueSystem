import { assert } from "ts/re/Common";
import { DBasics } from "ts/re/data/DBasics";
import { DEffectBehaviorId, DSkillId } from "ts/re/data/DCommon";
import { LEntity } from "ts/re/objects/LEntity";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";


export abstract class SEffectBehavior {

    /**
     * self が発動したスキルの処理が終わった (成否は target の result を確認すること)
     * Skill の効果として、特定 Behavior の状態を変えたりするのに使う。
     */
     //onSkillPerformed(cctx: SCommandContext, self: LEntity, targets: LEntity[], skillId: DSkillId): void {}
     
/*
    public onSelfEffectApplied(cctx: SCommandContext, modifier: SEffectModifier, entity: LEntity) {

    }

    */
    public onApplyTargetEffect(cctx: SCommandContext, performer: LEntity, modifier: SEffectModifier, target: LEntity): void {
        
    }
}



