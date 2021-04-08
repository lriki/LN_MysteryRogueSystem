import { LEntity } from "../objects/LEntity";
import { LBehavior } from "ts/objects/behaviors/LBehavior";
import { LStaffItemBehavior } from "ts/objects/behaviors/LStaffItemBehavior";
import { REGame } from "ts/objects/REGame";
import { LDebugMoveRightState } from "ts/objects/states/DebugMoveRightState";
import { LNapStateBehavior } from "ts/objects/states/LNapStateBehavior";
import { LKnockbackBehavior } from "ts/objects/abilities/LKnockbackBehavior";
import { LCommonBehavior } from "ts/objects/behaviors/LCommonBehavior";
import { REGame_DecisionBehavior } from "ts/objects/behaviors/REDecisionBehavior";
import { REUnitBehavior } from "ts/objects/behaviors/REUnitBehavior";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { LItemUserBehavior } from "ts/objects/behaviors/LItemUserBehavior";
import { LEquipmentUserBehavior } from "ts/objects/behaviors/LEquipmentUserBehavior";
import { LActorBehavior } from "ts/objects/behaviors/LBattlerBehavior";
import { REExitPointBehavior } from "ts/objects/behaviors/REExitPointBehavior";
import { LEnemyBehavior } from "ts/objects/behaviors/LEnemyBehavior";
import { LGenericRMMZStateBehavior } from "ts/objects/states/LGenericRMMZStateBehavior";
import { LItemBehavior } from "ts/objects/behaviors/LItemBehavior";
import { LEntryPointBehavior } from "ts/objects/behaviors/LEntryPointBehavior";

interface SBehaviorFactoryEntry {
    fullName: string;
    friendlyName: string;
    create: () => LBehavior;
};

export class SBehaviorFactory {
    public static _behaviorEntries: SBehaviorFactoryEntry[] = [
        { fullName: "LCommonBehavior", friendlyName: "_Common", create: () => new LCommonBehavior() },
        { fullName: "REGame_DecisionBehavior", friendlyName: "_Decision", create: () => new REGame_DecisionBehavior() },
        { fullName: "REUnitBehavior", friendlyName: "_Unit", create: () => new REUnitBehavior() },
        { fullName: "LInventoryBehavior", friendlyName: "_Inventory", create: () => new LInventoryBehavior() },
        { fullName: "LItemUserBehavior", friendlyName: "_ItemUser", create: () => new LItemUserBehavior() },
        { fullName: "LEquipmentUserBehavior", friendlyName: "_EquipmentUser", create: () => new LEquipmentUserBehavior() },
        { fullName: "LActorBehavior", friendlyName: "_Actor", create: () => new LActorBehavior() },
        { fullName: "REExitPointBehavior", friendlyName: "_ExitPoint", create: () => new REExitPointBehavior() },
        { fullName: "LEntryPointBehavior", friendlyName: "_EntryPoint", create: () => new LEntryPointBehavior() },
        { fullName: "LEnemyBehavior", friendlyName: "_Enemy", create: () => new LEnemyBehavior() },
        { fullName: "LGenericRMMZStateBehavior", friendlyName: "_GenericRMMZState", create: () => new LGenericRMMZStateBehavior() },
        { fullName: "LItemBehavior", friendlyName: "_Item", create: () => new LItemBehavior() },
        { fullName: "LNapStateBehavior", friendlyName: "NapState", create: () => new LNapStateBehavior() },
        { fullName: "LStaffItemBehavior", friendlyName: "StaffItem", create: () => new LStaffItemBehavior() },
        
        

        { fullName: "LKnockbackBehavior", friendlyName: "Knockback", create: () => new LKnockbackBehavior() },
    ];
    
    public static attachBehaviors(entity: LEntity, names: string[]): void {
        names.forEach(name => {
            const b = this.createBehavior(name);
            if (b)
                entity._addBehavior(b);
            else
                throw new Error(`Behavior "${name}" that you tried to add to the entity "${entity._name}" is invalid.`);
        });
    }
    
    public static createBehavior(name: string): LBehavior | undefined {
        const b = this.createBehaviorInstance(name);
        if (!b) return undefined;
        REGame.world._registerBehavior(b);
        return b;
    }

    public static createBehaviorInstance(name: string): LBehavior | undefined {
        const e = this._behaviorEntries.find(x => x.fullName == name || x.friendlyName == name);
        if (e) {
            return e.create();
        }
        else {
            switch (name) {
                //case "Staff":
                //    return new LStaffItemBehavior();
                case "DebugMoveRight":
                    return new LDebugMoveRightState();
                //case "Nap":
                //    return new LNapStateBehavior();
                default:
                    return undefined;
            }
        }
    }
}

