import { LTrapBehavior } from "../objects/behaviors/LTrapBehavior";
import { LUnitBehavior } from "../objects/behaviors/LUnitBehavior";
import { REGame } from "../objects/REGame";
import { paramMaxItemsInMap, paramMaxTrapsInMap } from "../PluginParameters";



export class ULimitations {
    
    public static getItemCountInMap(): number {
        const map = REGame.map;
        let count = 0;
        // Unit, Trap 以外を集計
        map.iterateEntities(e => {
            if (!e.findEntityBehavior(LUnitBehavior) && !e.findEntityBehavior(LTrapBehavior)) {
                count++;
            }
        });
        return count;
    }

    public static isItemCountFullyInMap(): boolean {
        return this.getItemCountInMap() >= paramMaxItemsInMap;
    }

    public static getTrapCountInMap(): number {
        const map = REGame.map;
        let count = 0;
        map.iterateEntities(e => {
            if (e.findEntityBehavior(LTrapBehavior)) {
                count++;
            }
        });
        return count;
    }

    public static getResidualsTrapCountInMap(): number {
        return Math.max(paramMaxTrapsInMap - this.getTrapCountInMap(), 0);
    }
}
