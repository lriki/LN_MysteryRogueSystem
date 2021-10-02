
import { DecisionPhase, LBehavior } from "./LBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { REGame } from "ts/re/objects/REGame";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { SPhaseResult } from "ts/re/system/RECommand";
import { LStructureId } from "../LCommon";
import { LEnemyBehavior } from "./LEnemyBehavior";
import { LDecisionBehavior } from "./LDecisionBehavior";
import { LBehaviorId } from "../LObject";
import { LItemShopStructure, LShopEntrance } from "../structures/LItemShopStructure";


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

    onDecisionPhase(context: SCommandContext, self: LEntity, phase: DecisionPhase): SPhaseResult {
        
        /*
        if (phase == DecisionPhase.AIMinor) {
            // 右へ移動するだけ
            let dir = 6;

            // ランダム移動
            //const table = [1,2,3,4,6,7,8,9];
            //const dir = table[REGame.world.random().nextIntWithMax(8)];


            if (dir != 0 && REGame.map.checkPassage(self, dir, MovingMethod.Walk)) {
                context.postActivity(LActivity.makeDirectionChange(self, dir));
                context.postActivity(LActivity.makeMoveToAdjacent(self, dir));
            }
            context.postConsumeActionToken(self);
            return SPhaseResult.Handled;
        }
        */

        return SPhaseResult.Pass;
    }
}

export class LMovingTargetFinder_Shopkeeper {
    private _shopkeeperId: LBehaviorId;

    public constructor(shopkeeper: LShopkeeperBehavior) {
        this._shopkeeperId = shopkeeper.id();
    }

    public decide(self: LEntity): (number[] | undefined) {
        const shopkeeper = REGame.world.behavior(this._shopkeeperId) as LShopkeeperBehavior;
        console.log("shopkeeper", shopkeeper);
        console.log("shop", shopkeeper.shop());
        const entrance = shopkeeper.shopEntrance();
        return [entrance.homeX(), entrance.homeY()];

        return undefined;
    }

    
}
