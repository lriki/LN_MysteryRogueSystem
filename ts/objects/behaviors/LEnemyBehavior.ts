
import { DEnemyId, RE_Data_Monster } from "ts/data/DEnemy";
import { DParameterId, REData } from "ts/data/REData";
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

    public init(enemyId: DEnemyId): LEnemyBehavior {
        this._enemyId = enemyId;
        return this;
    }

    onAttached(): void {
        this.recoverAll();
    }

    public enemyId(): DEnemyId {
        return this._enemyId;
    }

    public enemyData(): RE_Data_Monster {
        return REData.monsters[this._enemyId];
    }
    

    // Game_Enemy.prototype.paramBase
    idealParamBase(paramId: DParameterId): number {
        return this.enemyData().idealParams[paramId];
    }

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

