
import { assert } from "ts/re/Common";
import { DBasics } from "ts/re/data/DBasics";
import { DSpecialEffectCodes } from "ts/re/data/DCommon";
import { DEnemyId, DEnemy, DDropItem } from "ts/re/data/DEnemy";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { DParameterId } from "ts/re/data/DParameter";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { SEffect } from "ts/re/system/SEffectApplyer";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { UAction } from "ts/re/usecases/UAction";
import { USpawner } from "ts/re/usecases/USpawner";
import { LBehavior, LGenerateDropItemCause } from "../internal";
import { LEntity } from "../LEntity";
import { LRandom } from "../LRandom";
import { REGame } from "../REGame";
import { LBattlerBehavior } from "./LBattlerBehavior";
import { LInventoryBehavior } from "./LInventoryBehavior";


/**
 */
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
        this.recoverAll();
    }

    public enemyData(): DEnemy {
        const entity = this.ownerEntity().data();
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

    onCollectTraits(result: IDataTrait[]): void {
        super.onCollectTraits(result);
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
    
    onPreApplyEffect(context: SCommandContext, self: LEntity, effect: SEffect): SCommandResponse {
        const effectData = effect.data();
        if (effectData.qualifyings.specialEffectQualifyings.find(x => x.code == DSpecialEffectCodes.DeadlyExplosion)) {
            self.addState(DBasics.states.dead);
            return SCommandResponse.Handled;
        }
        return SCommandResponse.Pass;
    }
    
    onGenerateDropItems(self: LEntity, cause: LGenerateDropItemCause, result: LEntity[]): void {
        const inventory = self.findEntityBehavior(LInventoryBehavior);
        if (inventory && inventory.hasAnyItem()) {
            for (const item of inventory.entities()) {
                inventory.removeEntity(item);
                result.push(item);
            }
            return;
        }

        if (!self._dropItemGenerated) {
            self._dropItemGenerated = true;
            const rate = self.traitsSumOrDefault(DBasics.traits.ItemDropRate, 0, 0.05); // そもそも ItemDrop を発生させるか率
            const rand = REGame.world.random();
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
        }
        
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

