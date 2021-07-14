
import { assert } from "ts/Common";
import { DEnemyId, DEnemy } from "ts/data/DEnemy";
import { DParameterId } from "ts/data/DParameter";
import { REData } from "ts/data/REData";
import { RESystem } from "ts/system/RESystem";
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

    onAttached(): void {
        super.onAttached();
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
        return this.enemyData().idealParams[REData.parameters[paramId].battlerParamId];
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
}

