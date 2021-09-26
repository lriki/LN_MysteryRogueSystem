import { RESerializable } from "ts/re/Common";
import { REData } from "ts/re/data/REData";
import { Helpers } from "ts/re/system/Helpers";
import { SPhaseResult } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LCandidateSkillAction } from "ts/re/usecases/UAction";
import { UMovement } from "ts/re/usecases/UMovement";
import { LCharacterAI } from "../ai/LCharacterAI";
import { LEscapeAI } from "../ai/LEscapeAI";
import { LCharacterAI_Normal } from "../ai/LStandardAI";
import { BlockLayerKind } from "../LBlockLayer";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { DecisionPhase, LBehavior } from "./LBehavior";
import { LInventoryBehavior } from "./LInventoryBehavior";
import { LItemBehavior } from "./LItemBehavior";




/**
 * 
 */
@RESerializable
export class LItemThiefBehavior extends LBehavior {
    private characterAI: LCharacterAI = new LCharacterAI_Normal();//new LEscapeAI();

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LItemThiefBehavior);
        return b;
    }

    onPostMakeSkillActions(candidates: LCandidateSkillAction[]): void {
        console.log("onPostMakeSkillActions");

        const self = this.ownerEntity();
        const blocks = UMovement.getAdjacentBlocks(self);
        for (const block of blocks) {

            const item = block.getFirstEntity(BlockLayerKind.Ground);
            if (item && item.findEntityBehavior(LItemBehavior)) {
                // 隣接するアイテムを見つけた
                return;
            }

            
            const target = block.getFirstEntity(BlockLayerKind.Unit);
            if (target && Helpers.isHostile(self, target)) {
                const inventory = target.findEntityBehavior(LInventoryBehavior);
                if (inventory) {
                    if (inventory.entities().length > 0) {
                        console.log("アイテム盗み!!!");
                        candidates.splice(0);
                        candidates.push({
                            action: { rating: 100, skillId: REData.getSkill("kSkill_アイテム盗み").id },
                            targets: [target.entityId()],
                        });
                    }
                }
                // 隣接する敵対者を見つけた
                return;
            }
        }



        
    }

    onDecisionPhase(context: SCommandContext, self: LEntity, phase: DecisionPhase): SPhaseResult {
        if (phase == DecisionPhase.AIMinor) {
            return this.characterAI.thinkMoving(context, self);
        }
        else if (phase == DecisionPhase.AIMajor) {
            return this.characterAI.thinkAction(context, self);
        }
        return SPhaseResult.Pass;
    }
}

