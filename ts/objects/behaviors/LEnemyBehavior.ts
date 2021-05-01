
import { assert } from "ts/Common";
import { DEnemyId, RE_Data_Monster } from "ts/data/DEnemy";
import { DParameterId } from "ts/data/predefineds/DBasicParameters";
import { REData } from "ts/data/REData";
import { RESystem } from "ts/system/RESystem";
import { isThisTypeNode } from "typescript";
import { LBattlerBehavior } from "./LBattlerBehavior";
import { LBehavior } from "./LBehavior";


/**
 */
export class LEnemyBehavior extends LBattlerBehavior {

    private _enemyId: DEnemyId = 0;

    public constructor() {
        super();
    }

    public setup(enemyId: DEnemyId): void {
        this._enemyId = enemyId;
    }

    onAttached(): void {
        this.recoverAll();
    }

    public enemyId(): DEnemyId {
        return this._enemyId;
    }

    public enemyData(): RE_Data_Monster {
        assert(this._enemyId > 0);
        return REData.monsters[this._enemyId];
    }
    

    // Game_Enemy.prototype.paramBase
    idealParamBase(paramId: DParameterId): number {
        return this.enemyData().idealParams[paramId];
    }

    // Game_Enemy.prototype.exp
    public exp(): number {
        return this.enemyData().exp;
    };

    onQueryProperty(propertyId: number): any {
        if (propertyId == RESystem.properties.name)
            return this.enemyData().name;
        else
            super.onQueryProperty(propertyId);
    }

    onCollectTraits(result: IDataTrait[]): void {
        super.onCollectTraits(result);
        for (const t of this.enemyData().traits){
            result.push(t);
        }
    }
}

