
import { DecisionPhase, LBehavior } from "./LBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { REGame } from "ts/re/objects/REGame";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { SCommandResponse, SPhaseResult } from "ts/re/system/SCommand";
import { LStructureId } from "../LCommon";
import { LEnemyBehavior } from "./LEnemyBehavior";
import { LDecisionBehavior } from "./LDecisionBehavior";
import { LBehaviorId } from "../LObject";
import { LItemShopStructure, LShopEntrance } from "../structures/LItemShopStructure";
import { LMovingTargetFinder } from "../ai/LMovingTargetFinder";
import { SEventExecutionDialog } from "ts/re/system/dialogs/SEventExecutionDialog";
import { MRBasics } from "ts/re/data/MRBasics";
import { LActivity } from "../activities/LActivity";
import { LInventoryBehavior } from "./LInventoryBehavior";


/**
 */
export class LShopkeeperBehavior extends LBehavior {
    private _shopStructureId: LStructureId = 0;
    private _shopkeeperIndex = 0;   // ひとつの Shop 内での、店主番号

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LShopkeeperBehavior);
        return b;
    }

    public shopStructureId(): number {
        return this._shopStructureId;
    }

    public shopkeeperIndex(): number {
        return this._shopkeeperIndex;
    }

    public shop(): LItemShopStructure {
        return REGame.map.structures()[this._shopStructureId] as LItemShopStructure;
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

        const dialog = new SEventExecutionDialog(self.rmmzEventId, self);
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

export class LMovingTargetFinder_Shopkeeper extends LMovingTargetFinder {
    private _ownerShopkeeperId: LBehaviorId;

    public constructor(shopkeeper: LShopkeeperBehavior) {
        super();
        this._ownerShopkeeperId = shopkeeper.id();
    }

    public decide(self: LEntity): (number[] | undefined) {
        const shopkeeper = REGame.world.behavior(this._ownerShopkeeperId) as LShopkeeperBehavior;
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
