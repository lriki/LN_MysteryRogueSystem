
import { DEnemyId, RE_Data_Monster } from "ts/data/DEnemy";
import { REData } from "ts/data/REData";
import { RESystem } from "ts/system/RESystem";
import { isThisTypeNode } from "typescript";
import { LBehavior } from "./LBehavior";


/**
 */
export class LEnemyBehavior extends LBehavior {

    private _enemyId: DEnemyId = 0;

    public constructor() {
        super();
    }

    public init(enemyId: DEnemyId): LEnemyBehavior {
        this._enemyId = enemyId;
        return this;
    }

    public enemyId(): DEnemyId {
        return this._enemyId;
    }

    public enemyData(): RE_Data_Monster {
        return REData.monsters[this._enemyId];
    }

    onQueryProperty(propertyId: number): any {
        if (propertyId == RESystem.properties.name)
            return this.enemyData().name;
        else
            super.onQueryProperty(propertyId);
    }
}

