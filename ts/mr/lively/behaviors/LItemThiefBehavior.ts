import { MRSerializable } from "ts/mr/Common";
import { DBlockLayerKind } from "ts/mr/data/DCommon";
import { MRData } from "ts/mr/data/MRData";
import { Helpers } from "ts/mr/system/Helpers";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { LCandidateSkillAction } from "ts/mr/utility/UAction";
import { UMovement } from "ts/mr/utility/UMovement";
import { USearch } from "ts/mr/utility/USearch";
import { LCharacterAI } from "../ai/LCharacterAI";
import { LEscapeAI } from "../ai/LEscapeAI";
import { LMovingTargetFinder_Item } from "../ai/LMovingTargetFinder";
import { LCharacterAI_Normal } from "../ai/LStandardAI";
import { LEntity } from "../entity/LEntity";
import { MRLively } from "../MRLively";
import { DecisionPhase, LBehavior, LBehaviorGroup, LGenerateDropItemCause } from "./LBehavior";
import { LInventoryBehavior } from "../entity/LInventoryBehavior";
import { LItemBehavior } from "./LItemBehavior";




/**
 * 
 */
@MRSerializable
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

    
    [2021/10/3] ドロップアイテム
    ----------
    - ランダムドロップ (床落ちアイテムテーブルから)
    - エネミー固有のドロップアイテム
    - 転んだときのランダムドロップ
    - 盗んだアイテム
    - ケンゴウ系に弾かれたとき (床落ちアイテムテーブルから種別指定でドロップ)
    - マゼルン系のようなインベントリからのドロップ
    - 行商人は転ぶと複数アイテムを落とす

    盗み系やマゼルン系は転んだときに、持っているアイテムをドロップする。
    それ以降は倒してもランダムドロップしない。

    一度アイテムをドロップしたかどうかを示すフラグを Entity に持たせてみる。
    このフラグは色々な Behavior から参照するので、どこかの Behavior ではなく Entity に持たせる。

    onGenerateDropItem(cause) でドロップアイテムを生成してみる。
    引数で原因を受け取る。
    - 転び -> エネミー固有のランダムドロップは処理しない
    - 戦闘不能

    ケンゴウ系は特殊で、アイテムの生成とフラグONは外側 (装備はじきBehavior側) で実装する。


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
        const b = MRLively.world.spawn(LItemThiefBehavior);
        return b;
    }

    public behaviorGroup(): LBehaviorGroup {
        return LBehaviorGroup.SpecialAbility;
    }

    onPostMakeSkillActions(candidates: LCandidateSkillAction[]): void {
        const self = this.ownerEntity();
        const blocks = UMovement.getAdjacentBlocks(self);

        // まずは隣接している Unit をチェック。床落ちアイテムと隣接していても、こちらを優先したい。
        for (const block of blocks) {
            const target = block.getFirstEntity(DBlockLayerKind.Unit);
            if (target && Helpers.isHostile(self, target)) {
                const inventory = target.findEntityBehavior(LInventoryBehavior);
                if (inventory) {
                    if (inventory.items.length > 0) {
                        candidates.push({
                            action: { rating: 100, skillId: MRData.getSkill("kSkill_アイテム盗み").id },
                            targets: [target.entityId()],
                        });
                    }
                }
                // 隣接する敵対者を見つけた
                return;
            }
        }

        // 次に床落ちアイテムをチェック
        for (const block of blocks) {

            const item = block.getFirstEntity(DBlockLayerKind.Ground);
            if (item && item.findEntityBehavior(LItemBehavior)) {
                // 隣接する床落ちアイテムを見つけた

                // ただし、Unit もいるなら盗まない
                if (!!block.getFirstEntity(DBlockLayerKind.Unit)) continue;
                
                if (item == USearch.findLatestItemInVisibilityBlocks(self)) {   // それは視界内の最も新しいアイテム？
                    candidates.push({
                        action: { rating: 100, skillId: MRData.getSkill("kSkill_アイテム盗み").id },
                        targets: [item.entityId()],
                    });
                }
                return;
            }
        }
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

