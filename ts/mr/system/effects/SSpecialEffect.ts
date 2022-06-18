import { assert } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import { DSpecificEffectId, DSkillId } from "ts/mr/data/DCommon";
import { LEntity } from "ts/mr/objects/LEntity";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { LEffectResult } from "ts/mr/objects/LEffectResult";
import { DSpecialEffectRef } from "ts/mr/data/DEffect";


export abstract class SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffectModifier, target: LEntity, result: LEffectResult): void {
        
    }

    //public onEmittorPerformed(cctx: SCommandContext, self: LEntity, targets: LEntity[]): void {}
     
/*
    public onSelfEffectApplied(cctx: SCommandContext, modifier: SEffectModifier, entity: LEntity) {

    }

    */
}
