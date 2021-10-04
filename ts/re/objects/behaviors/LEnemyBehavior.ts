
import { assert } from "ts/re/Common";
import { DBasics } from "ts/re/data/DBasics";
import { DSpecialEffectCodes } from "ts/re/data/DCommon";
import { DEnemyId, DEnemy } from "ts/re/data/DEnemy";
import { DParameterId } from "ts/re/data/DParameter";
import { DTraits } from "ts/re/data/DTraits";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { SEffect } from "ts/re/system/SEffectApplyer";
import { UAction } from "ts/re/usecases/UAction";
import { USpawner } from "ts/re/usecases/USpawner";
import { LBehavior, LGenerateDropItemCause } from "../internal";
import { LEntity } from "../LEntity";
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
        if (inventory) {
            for (const item of inventory.entities()) {
                inventory.removeEntity(item);
                result.push(item);
                //UAction.dropOrDestroy(context, entity, self.x, self.y);
            }
            return;
        }
        
        const rate = self.traitsSumOrDefault(DTraits.RandomItemDropRate, 0, 0.05);
        const rand = REGame.world.random();
        if (rand.nextIntWithMax(100) < rate * 100) {
            const item = USpawner.createItemFromSpawnTableOrDefault(self.floorId, rand);
            result.push(item);
        }
    }
}

