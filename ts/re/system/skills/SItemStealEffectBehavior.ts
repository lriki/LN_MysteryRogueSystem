import { DBasics } from "ts/re/data/DBasics";
import { LEntity } from "ts/re/objects/LEntity";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";
import { SEffectBehavior } from "./SEffectBehavior";

export class SItemStealSkillBehavior extends SEffectBehavior {

    public onApplyTargetEffect(cctx: SCommandContext, performer: LEntity, modifier: SEffectModifier, target: LEntity) {
        console.log("SItemStealSkillBehavior");
        cctx.postSequel(performer, DBasics.sequels.warp);

    }
}
