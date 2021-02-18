import { REGame_Entity } from "../objects/REGame_Entity";
import { LUnitAttribute } from "../objects/attributes/LUnitAttribute";
import { REData } from "../data/REData";
import { REGame } from "../objects/REGame";
import { REGame_DecisionBehavior } from "../objects/behaviors/REDecisionBehavior";
import { REUnitBehavior } from "../objects/behaviors/REUnitBehavior";
import { RETileAttribute } from "../objects/attributes/RETileAttribute";
import { TileKind } from "../objects/REGame_Block";
import { REExitPointBehavior } from "ts/objects/behaviors/REExitPointBehavior";
import { LActorBehavior, LBattlerBehavior } from "ts/objects/behaviors/LBattlerBehavior";
import { LItemUserBehavior } from "ts/objects/behaviors/LItemUserBehavior";
import { LCommonBehavior } from "ts/objects/behaviors/LCommonBehavior";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { LItemBehavior } from "ts/objects/behaviors/LItemBehavior";
import { LTrapBehavior } from "ts/objects/behaviors/LTrapBehavior";
import { LEnemyBehavior } from "ts/objects/behaviors/LEnemyBehavior";
import { LEquipmentBehavior } from "ts/objects/behaviors/LEquipmentBehavior";
import { LEquipmentUserBehavior } from "ts/objects/behaviors/LEquipmentUserBehavior";
import { LBehavior } from "ts/objects/behaviors/LBehavior";
import { LStaffItemBehavior } from "ts/objects/behaviors/LStaffItemBehavior";

export class SBehaviorFactory {
    public static attachBehaviors(entity: REGame_Entity, names: string[]): void {
        names.forEach(name => {
            entity.addBasicBehavior(this.createBehavior(name));
        });
    }

    public static createBehavior(name: string): LBehavior {
        switch (name) {
            case "Staff":
                return new LStaffItemBehavior();
            default:
                throw new Error();
        }
    }
}

