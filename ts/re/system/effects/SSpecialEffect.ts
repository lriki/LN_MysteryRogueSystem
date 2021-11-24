import { assert } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { DSpecificEffectId, DSkillId } from "ts/re/data/DCommon";
import { LEntity } from "ts/re/objects/LEntity";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { LEffectResult } from "ts/re/objects/LEffectResult";


export abstract class SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, id: DSpecificEffectId, performer: LEntity, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        
    }

    //public onEmittorPerformed(cctx: SCommandContext, self: LEntity, targets: LEntity[]): void {}
     
/*
    public onSelfEffectApplied(cctx: SCommandContext, modifier: SEffectModifier, entity: LEntity) {

    }

    */
}
