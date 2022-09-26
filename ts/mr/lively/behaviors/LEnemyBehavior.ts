
import { assert, MRSerializable } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import {  DEnemy, DDropItem } from "ts/mr/data/DEnemy";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { DParameterId } from "ts/mr/data/DCommon";
import {  SPhaseResult } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { USpawner } from "ts/mr/utility/USpawner";
import { DecisionPhase, LBehavior, LGenerateDropItemCause } from "../internal";
import { LEntity } from "../LEntity";
import { LRandom } from "../LRandom";
import { REGame } from "../REGame";
import { LBattlerBehavior } from "./LBattlerBehavior";
import { LInventoryBehavior } from "./LInventoryBehavior";

/**
 */
@MRSerializable
export class LEnemyBehavior extends LBattlerBehavior {
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LEnemyBehavior);
        return b;
    }

    public constructor() {
        super();
    }

    onAttached(self: LEntity): void {
        super.onAttached(self);
        self.recoverAll();
    }

    public enemyData(): DEnemy {
        const entity = this.ownerEntity().data;
        assert(entity.enemy);
        return entity.enemy;
    }
    

    // Game_Enemy.prototype.paramBase
    onQueryIdealParamBase(paramId: DParameterId, base: number): number {
        const param = this.enemyData().entity().idealParams[paramId];
        return base + ((param === undefined) ? 0 : param);
    }

    // Game_Enemy.prototype.exp
    public exp(): number {
        return this.enemyData().exp;
    }

    onCollectTraits(self: LEntity, result: IDataTrait[]): void {
        super.onCollectTraits(self, result);
        for (const t of this.enemyData().traits){
            result.push(t);
        }
    }

    onCollectSkillActions(result: IDataAction[]): void {
        super.onCollectSkillActions(result);
        for (const t of this.enemyData().actions){
            result.push(t);
        }
    }
    
    // onPreApplyEffect(self: LEntity, cctx: SCommandContext, effect: SEffect): SCommandResponse {
    //     const effectData = effect.data();
    //     if (effectData.qualifyings.specialEffectQualifyings.find(x => x.code == DSpecialEffectCodes.DeadlyExplosion)) {
    //         self.addState(REBasics.states.dead);
    //         return SCommandResponse.Handled;
    //     }
    //     return SCommandResponse.Pass;
    // }
    
    onGenerateDropItems(self: LEntity, cause: LGenerateDropItemCause, result: LEntity[]): void {
        const inventory = self.findEntityBehavior(LInventoryBehavior);
        if (inventory && inventory.hasAnyItem()) {
            for (const item of inventory.items) {
                inventory.removeEntity(item);
                result.push(item);
            }
            return;
        }

        if (!self._dropItemGenerated) {
            self._dropItemGenerated = true;
            const rand = REGame.world.random();
            switch (cause) {
                case LGenerateDropItemCause.Dead:
                    const rate = self.traitsSumOrDefault(MRBasics.traits.ItemDropRate, 0, 0.05); // そもそも ItemDrop を発生させるか率
                    if (rand.nextIntWithMax(100) < rate * 100) {
        
                        // Enemy 固有のドロップアイテム
                        const item1 = this.selectDropItem(REGame.world.random());
                        if (item1) {
                            const info = DEntityCreateInfo.makeSingle(item1.entityId);
                            info.gold = item1.gold;
                            result.push(SEntityFactory.newEntity(info, self.floorId));
                            return;
                        }
        
                        // 出現テーブルからのドロップアイテム
                        const item2 = USpawner.createItemFromSpawnTable(self.floorId, rand);
                        if (item2) {
                            result.push(item2);
                            return;
                        }
                    }
                    break;
                case LGenerateDropItemCause.Stumble: {
                    // 出現テーブルからのドロップアイテム
                    const item2 = USpawner.createItemFromSpawnTable(self.floorId, rand);
                    if (item2) {
                        result.push(item2);
                        return;
                    }
                    break;
                }
                default:
                    throw new Error("Unreachable.");
            }
        }
    }


    onDecisionPhase(self: LEntity, cctx: SCommandContext, phase: DecisionPhase): SPhaseResult {
        if (phase == DecisionPhase.ResolveAdjacentAndMovingTarget) {

            // 相手のいる方向を向く
            // const target = UAction.findInSightNearlyHostileEntity(self);
            // if (target) {
            //     const dir = SAIHelper.entityDistanceToDir(self, target);
            //     self.dir = dir;
            // }


            return SPhaseResult.Pass;
        }
        return SPhaseResult.Pass;
    }

    public selectDropItem(rand: LRandom): DDropItem | undefined {
        const items = this.enemyData().dropItems;
        const total = items.reduce((s, x) => s + x.denominator, 0);
        let r = rand.nextIntWithMax(total);
        for (const item of items) {
            if (r - item.denominator <= 0) {
                return item;
            }
            r -= item.denominator;
        }
        return undefined;
    }
}

