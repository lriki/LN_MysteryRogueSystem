
import { DecisionPhase, LBehavior } from "./LBehavior";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { MRLively } from "ts/mr/lively/MRLively";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { SCommandResponse, SPhaseResult } from "ts/mr/system/SCommand";
import { LStructureId } from "../LCommon";
import { LEnemyBehavior } from "./LEnemyBehavior";
import { LDecisionBehavior } from "./LDecisionBehavior";
import { LBehaviorId } from "../LObject";
import { LItemShopStructure, LShopEntrance } from "../structures/LItemShopStructure";
import { LMovingTargetFinder } from "../ai/LMovingTargetFinder";
import { SEventExecutionDialog } from "ts/mr/system/dialogs/SEventExecutionDialog";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LActivity } from "../activities/LActivity";
import { LInventoryBehavior } from "../entity/LInventoryBehavior";
import { MRSerializable } from "ts/mr/Common";
import { LThinkingActionRatings, LThinkingAgent } from "../ai2/LThinkingAgent";
import { MRData } from "ts/mr/data/MRData";
import { LThinkingAction } from "../ai2/LThinkingAction";


/**
 */
@MRSerializable
export class LShopkeeperBehavior extends LBehavior {
    private _shopStructureId: LStructureId = 0;
    private _shopkeeperIndex = 0;   // ひとつの Shop 内での、店主番号

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LShopkeeperBehavior);
        return b;
    }

    public shopStructureId(): number {
        return this._shopStructureId;
    }

    public shopkeeperIndex(): number {
        return this._shopkeeperIndex;
    }

    public shop(): LItemShopStructure {
        return MRLively.mapView.currentMap.structures()[this._shopStructureId] as LItemShopStructure;
    }

    // この店主が守るべき入り口情報。大部屋の場合は全店主が同じ個所を指すこともある。
    public shopEntrance(): LShopEntrance {
        return this.shop().shopEntrance(this._shopkeeperIndex);
    }

    public setup(shopStructureId: LStructureId, shopkeeperIndex: number): void {
        this._shopStructureId = shopStructureId;
        this._shopkeeperIndex = shopkeeperIndex;
    }

    onAttached(self: LEntity): void {
        const decision = self.getEntityBehavior(LDecisionBehavior);
        decision.characterAI().setMovingTargetFinder(new LMovingTargetFinder_Shopkeeper(this));
    }

    override onThink(self: LEntity, agent: LThinkingAgent): SPhaseResult {
        const shop = this.shop();
        const entrance = this.shopEntrance();
        const targetPos = shop.checkBilling() ? [entrance.gateX(), entrance.gateY()] : [entrance.homeX(), entrance.homeY()];
        
        if (targetPos[0] == self.mx && targetPos[1] == self.my) {
            const action = new LThinkingAction(
                { 
                    rating: LThinkingActionRatings.BasicActionsEnd + 1,
                    skillId: MRData.system.skills.wait,
                },
                [],
            );
            agent.addCandidateAction(action);
        }
        else {
            const action = new LThinkingAction(
                { 
                    rating: LThinkingActionRatings.Moving,
                    skillId: MRData.system.skills.move,
                },
                [],
            );
            action.priorityTargetX = targetPos[0];
            action.priorityTargetY = targetPos[1];
            agent.addCandidateAction(action);
        }

        return SPhaseResult.Pass;
    }

    onDecisionPhase(self: LEntity, cctx: SCommandContext, phase: DecisionPhase): SPhaseResult {
        
        /*
        if (phase == DecisionPhase.AIMinor) {
            // 右へ移動するだけ
            let dir = 6;

            // ランダム移動
            //const table = [1,2,3,4,6,7,8,9];
            //const dir = table[REGame.world.random().nextIntWithMax(8)];


            if (dir != 0 && REGame.map.checkPassage(self, dir, MovingMethod.Walk)) {
                cctx.postActivity(LActivity.makeDirectionChange(self, dir));
                cctx.postActivity(LActivity.makeMoveToAdjacent(self, dir));
            }
            cctx.postConsumeActionToken(self);
            return SPhaseResult.Handled;
        }
        */

        return SPhaseResult.Pass;
    }
    
    onTalk(self: LEntity, cctx: SCommandContext, person: LEntity): SCommandResponse {

        const dialog = new SEventExecutionDialog(self.rmmzEventId, self, person);
        dialog.billingPrice = this.shop().getBillingPrice();
        dialog.depositPrice = this.shop().getDepositPriece();

        cctx.openDialog(self, dialog, false);
        // .then(dialog => {
        //     console.log("dialog", dialog);
        // });
        return SCommandResponse.Handled;
    }
    
    onActivityReaction(self: LEntity, cctx: SCommandContext, activity: LActivity): SCommandResponse {
        
        if (activity.actionId() == MRBasics.actions.dialogResult) {
            if (activity.selectedAction() == "yes") {
                const billingPrice = this.shop().getBillingPrice();
                const subject = activity.subject();
                const inventory = subject.getEntityBehavior(LInventoryBehavior);
                if (inventory.gold() >= billingPrice) {
                    inventory.loseGold(billingPrice);
                    this.shop().commitBilling();
                }
                else {
                    throw new Error("Not implemented.");
                }
            }
            return SCommandResponse.Handled;
        }

        return SCommandResponse.Pass;
    }
}


@MRSerializable
export class LMovingTargetFinder_Shopkeeper extends LMovingTargetFinder {
    private _ownerShopkeeperId: LBehaviorId;

    public constructor(shopkeeper: LShopkeeperBehavior) {
        super();
        this._ownerShopkeeperId = shopkeeper.id();
    }

    public decide(self: LEntity): (number[] | undefined) {
        const shopkeeper = MRLively.world.behavior(this._ownerShopkeeperId) as LShopkeeperBehavior;
        const shop = shopkeeper.shop();

        // const room = REGame.map.room(shop.roomId());
        // room.

        // shop.clientFaction()

        
        const entrance = shopkeeper.shopEntrance();

        if (shop.checkBilling()) {
            return [entrance.gateX(), entrance.gateY()];
        }
        else {
            return [entrance.homeX(), entrance.homeY()];
        }
    }

    
}
