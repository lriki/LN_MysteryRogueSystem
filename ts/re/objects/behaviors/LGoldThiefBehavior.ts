import { MRSerializable } from "ts/re/Common";
import { DBlockLayerKind } from "ts/re/data/DCommon";
import { MRData } from "ts/re/data/MRData";
import { Helpers } from "ts/re/system/Helpers";
import { SPhaseResult } from "ts/re/system/SCommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LCandidateSkillAction } from "ts/re/usecases/UAction";
import { UMovement } from "ts/re/usecases/UMovement";
import { USearch } from "ts/re/usecases/USearch";
import { LCharacterAI } from "../ai/LCharacterAI";
import { LEscapeAI } from "../ai/LEscapeAI";
import { LMovingTargetFinder_Gold } from "../ai/LMovingTargetFinder";
import { LCharacterAI_Normal } from "../ai/LStandardAI";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { DecisionPhase, LBehavior } from "./LBehavior";
import { LInventoryBehavior } from "./LInventoryBehavior";
import { LItemBehavior } from "./LItemBehavior";




/**
 * 
 */
@MRSerializable
export class LGoldThiefBehavior extends LBehavior {
    private _standardAI: LCharacterAI_Normal;
    private _escapeAI: LEscapeAI;

    public constructor() {
        super();
        this._standardAI = new LCharacterAI_Normal();
        this._escapeAI = new LEscapeAI();
        this._standardAI.setMovingTargetFinder(new LMovingTargetFinder_Gold());
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LGoldThiefBehavior);
        return b;
    }

    onPostMakeSkillActions(candidates: LCandidateSkillAction[]): void {
        const self = this.ownerEntity();
        const blocks = UMovement.getAdjacentBlocks(self);

        // 隣接している Unit をチェック。アイテムが同時に隣接していても、こちらを優先したい。
        for (const block of blocks) {
            const target = block.getFirstEntity(DBlockLayerKind.Unit);
            if (target && Helpers.isHostile(self, target)) {
                const inventory = target.findEntityBehavior(LInventoryBehavior);
                if (inventory) {
                    if (inventory.gold() > 0) {
                        candidates.push({
                            action: { rating: 100, skillId: MRData.getSkill("kSkill_ゴールド盗み").id },
                            targets: [target.entityId()],
                        });
                    }
                }
                // 隣接する敵対者を見つけた
                return;
            }
        }

        /*
        // 次にアイテムをチェック
        for (const block of blocks) {

            const item = block.getFirstEntity(DBlockLayerKind.Ground);
            if (item && item.findEntityBehavior(LItemBehavior)) {
                // 隣接するアイテムを見つけた
                if (item == USearch.findLatestItemInVisibilityBlocks(self)) {   // それは視界内の最も新しいアイテム？
                    candidates.push({
                        action: { rating: 100, skillId: REData.getSkill("kSkill_ゴールド盗み").id },
                        targets: [item.entityId()],
                    });
                }
                return;
            }
        }
        */
    }

    onDecisionPhase(self: LEntity, cctx: SCommandContext, phase: DecisionPhase): SPhaseResult {
        if (phase == DecisionPhase.AIMinor) {
            this.activeAI(self).thinkMoving(cctx, self);
            return SPhaseResult.Handled;
        }
        else if (phase == DecisionPhase.AIMajor) {
            this.activeAI(self).thinkAction(cctx, self);
            return SPhaseResult.Handled;
        }
        return SPhaseResult.Pass;
    }

    private activeAI(self: LEntity): LCharacterAI {
        const inventory = self.getEntityBehavior(LInventoryBehavior);
        if (inventory.hasAnyItem()) {
            return this._escapeAI;
        }
        else {
            return this._standardAI;
        }
    }
}

