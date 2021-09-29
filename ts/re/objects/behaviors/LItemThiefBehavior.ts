import { RESerializable } from "ts/re/Common";
import { DBlockLayerKind } from "ts/re/data/DCommon";
import { REData } from "ts/re/data/REData";
import { Helpers } from "ts/re/system/Helpers";
import { SPhaseResult } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LCandidateSkillAction } from "ts/re/usecases/UAction";
import { UMovement } from "ts/re/usecases/UMovement";
import { USearch } from "ts/re/usecases/USearch";
import { LCharacterAI } from "../ai/LCharacterAI";
import { LEscapeAI } from "../ai/LEscapeAI";
import { LMovingTargetFinder_Item } from "../ai/LMovingTargetFinder";
import { LCharacterAI_Normal } from "../ai/LStandardAI";
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
    
    /*
    [2021/9/29] Entity 分類方法考え中
    ----------
    - Gold は Item も兼ねる。
    - Trap は Item も兼ねる。
    - アイテム化けしたモンスターは Item として認識される。
    - 土偶は "立てる" 前後で Item,Unit の性質がかわる。
    こういった様々な事情があるので、enum での分類は困難。やるならタグ式にするしかない。

    ただ「盗めるアイテム」という視点で見るとただタグ分けするだけでは足りなくて、
    - 床に張り付いている巻物は盗めない。
    - 装備しているアイテムは盗めない。
    - 視界にあっても、水没や氷結しているアイテムは盗めない。※水没に関してはモンスター自身が水中侵入できるかにも依る。
    - 店売りアイテムは盗めない。
    こちらも様々な制約がある。
    基本的にこれらはアイテム側の状態が「盗めるか？」に影響してくる。
    今後の拡張も考えると、ItemThief 側がアイテムの状態を細かく見るのは好ましくない。
    「拾えるか？」判定と同じように、アイテム側で条件判断するべきだろう。
    */

    private _standardAI: LCharacterAI_Normal;
    private _escapeAI: LEscapeAI;

    public constructor() {
        super();
        this._standardAI = new LCharacterAI_Normal();
        this._escapeAI = new LEscapeAI();
        this._standardAI.setMovingTargetFinder(new LMovingTargetFinder_Item());
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LItemThiefBehavior);
        return b;
    }

    onPostMakeSkillActions(candidates: LCandidateSkillAction[]): void {
        const self = this.ownerEntity();
        const blocks = UMovement.getAdjacentBlocks(self);

        // まずは隣接している Unit をチェック。アイテムが同時に隣接していても、こちらを優先したい。
        for (const block of blocks) {
            const target = block.getFirstEntity(DBlockLayerKind.Unit);
            if (target && Helpers.isHostile(self, target)) {
                const inventory = target.findEntityBehavior(LInventoryBehavior);
                if (inventory) {
                    if (inventory.entities().length > 0) {
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

        // 次にアイテムをチェック
        for (const block of blocks) {

            const item = block.getFirstEntity(DBlockLayerKind.Ground);
            if (item && item.findEntityBehavior(LItemBehavior)) {
                // 隣接するアイテムを見つけた
                if (item == USearch.findLatestItemInVisibilityBlocks(self)) {   // それは視界内の最も新しいアイテム？
                    candidates.push({
                        action: { rating: 100, skillId: REData.getSkill("kSkill_アイテム盗み").id },
                        targets: [item.entityId()],
                    });
                }
                return;
            }
        }
    }

    onDecisionPhase(context: SCommandContext, self: LEntity, phase: DecisionPhase): SPhaseResult {
        if (phase == DecisionPhase.AIMinor) {
            this.activeAI(self).thinkMoving(context, self);
            return SPhaseResult.Handled;
        }
        else if (phase == DecisionPhase.AIMajor) {
            this.activeAI(self).thinkAction(context, self);
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

