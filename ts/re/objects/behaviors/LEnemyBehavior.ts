
import { assert } from "ts/re/Common";
import { DBasics } from "ts/re/data/DBasics";
import { DSpecialEffectCodes } from "ts/re/data/DCommon";
import { DEnemyId, DEnemy } from "ts/re/data/DEnemy";
import { DParameterId } from "ts/re/data/DParameter";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { SEffect } from "ts/re/system/SEffectApplyer";
import { LBehavior } from "../internal";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { LBattlerBehavior } from "./LBattlerBehavior";


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

    public enemyId(): DEnemyId {
        const entity = this.ownerEntity().data();
        assert(entity.enemy);
        return entity.enemy.id;
    }

    public enemyData(): DEnemy {
        const entity = this.ownerEntity().data();
        assert(entity.enemy);
        return entity.enemy;
    }
    

    // Game_Enemy.prototype.paramBase
    onGetIdealParamBase(paramId: DParameterId): number {
        const param = this.enemyData().entity().idealParams[paramId];
        return (param === undefined) ? 0 : param;
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
}

