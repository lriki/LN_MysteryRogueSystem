import { LEntity } from "../objects/LEntity";
import { LBehavior } from "ts/re/objects/behaviors/LBehavior";
import { REGame } from "ts/re/objects/REGame";
import { LDebugMoveRightState } from "ts/re/objects/states/DebugMoveRightState";
import { LNapStateBehavior } from "ts/re/objects/states/LNapStateBehavior";
import { LKnockbackBehavior } from "ts/re/objects/abilities/LKnockbackBehavior";
import { LCommonBehavior } from "ts/re/objects/behaviors/LCommonBehavior";
import { LDecisionBehavior } from "ts/re/objects/behaviors/LDecisionBehavior";
import { LUnitBehavior } from "ts/re/objects/behaviors/LUnitBehavior";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LItemUserBehavior } from "ts/re/objects/behaviors/LItemUserBehavior";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { LExitPointBehavior } from "ts/re/objects/behaviors/LExitPointBehavior";
import { LEnemyBehavior } from "ts/re/objects/behaviors/LEnemyBehavior";
import { LActorBehavior } from "ts/re/objects/behaviors/LActorBehavior";
import { LItemBehavior } from "ts/re/objects/behaviors/LItemBehavior";
import { LEntryPointBehavior } from "ts/re/objects/behaviors/LEntryPointBehavior";
import { LGenericRMMZStateBehavior } from "ts/re/objects/states/LGenericRMMZStateBehavior";
import { LItemImitatorBehavior } from "ts/re/objects/behaviors/LItemImitatorBehavior";
import { LIllusionStateBehavior } from "ts/re/objects/states/LIllusionStateBehavior";

interface SBehaviorFactoryEntry {
    fullName: string;
    friendlyName: string;
    create: () => LBehavior;
};

export class SBehaviorFactory {
    private static _behaviorEntries: SBehaviorFactoryEntry[] = [
        { fullName: "LCommonBehavior", friendlyName: "_Common", create: () => new LCommonBehavior() },
        { fullName: "REGame_DecisionBehavior", friendlyName: "_Decision", create: () => new LDecisionBehavior() },
        { fullName: "REUnitBehavior", friendlyName: "_Unit", create: () => new LUnitBehavior() },
        { fullName: "LInventoryBehavior", friendlyName: "_Inventory", create: () => new LInventoryBehavior() },
        { fullName: "LItemUserBehavior", friendlyName: "_ItemUser", create: () => new LItemUserBehavior() },
        { fullName: "LEquipmentUserBehavior", friendlyName: "_EquipmentUser", create: () => new LEquipmentUserBehavior() },
        { fullName: "LActorBehavior", friendlyName: "_Actor", create: () => new LActorBehavior() },
        { fullName: "REExitPointBehavior", friendlyName: "_ExitPoint", create: () => new LExitPointBehavior() },
        { fullName: "LEntryPointBehavior", friendlyName: "_EntryPoint", create: () => new LEntryPointBehavior() },
        { fullName: "LEnemyBehavior", friendlyName: "_Enemy", create: () => new LEnemyBehavior() },
        { fullName: "LGenericRMMZStateBehavior", friendlyName: "_GenericRMMZState", create: () => new LGenericRMMZStateBehavior() },
        { fullName: "LItemBehavior", friendlyName: "_Item", create: () => new LItemBehavior() },
        { fullName: "LNapStateBehavior", friendlyName: "NapState", create: () => new LNapStateBehavior() },
        { fullName: "LItemImitatorBehavior", friendlyName: "ItemImitator", create: () => new LItemImitatorBehavior() },
        { fullName: "LIllusionStateBehavior", friendlyName: "IllusionState", create: () => new LIllusionStateBehavior() },
        
        
        

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
    
    /*
    public static attachBehaviorsToState(state: LState, names: string[]): void {
        const behavior = new LGenericRMMZStateBehavior();
        REGame.world._registerBehavior(behavior);

        
        const behabiors: LStateTraitBehavior[] = [behavior];
        for (const behaviorName of state.stateData().behaviors) {
            const b = SBehaviorFactory.createBehavior(behaviorName) as LStateTraitBehavior;
            if (!b) throw new Error(`Behavior "${behaviorName}" specified in state "${stateId}:${this.stateData().displayName}" is invalid.`);
            behabiors.push(b);
        }


        names.forEach(name => {
            const b = this.createBehavior(name);
            if (b)
                entity._addBehavior(b);
            else
                throw new Error(`Behavior "${name}" that you tried to add to the entity "${entity._name}" is invalid.`);
        });
    }
    */
    
    public static createBehavior(name: string): LBehavior | undefined {
        const b = this.createBehaviorInstance(name);
        if (!b) return undefined;
        REGame.world._registerObject(b);
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

