import { LEntity } from "ts/mr/lively/LEntity";
import { SCommandContext } from "../SCommandContext";
import { SEffect } from "../SEffectApplyer";
import { LEffectResult } from "ts/mr/lively/LEffectResult";
import { DSpecialEffectRef } from "ts/mr/data/DSpecialEffect";


export abstract class SSpecialEffect {

    public onApplyTargetEffect(cctx: SCommandContext, data: DSpecialEffectRef, performer: LEntity, item: LEntity | undefined, modifier: SEffect, target: LEntity, result: LEffectResult): void {
        
    }

    //public onEmittorPerformed(cctx: SCommandContext, self: LEntity, targets: LEntity[]): void {}
     
/*
    public onSelfEffectApplied(cctx: SCommandContext, modifier: SEffectModifier, entity: LEntity) {

    }

    */
}
