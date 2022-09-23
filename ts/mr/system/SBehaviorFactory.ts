import { LEntity } from "../lively/LEntity";
import { LBehavior } from "ts/mr/lively/behaviors/LBehavior";
import { REGame } from "ts/mr/lively/REGame";
import { LDebugMoveRightBehavior } from "ts/mr/lively/states/LDebugMoveRight";
import { LNapStateBehavior } from "ts/mr/lively/states/LNapStateBehavior";
import { LKnockbackBehavior } from "ts/mr/lively/abilities/LKnockbackBehavior";
import { LCommonBehavior } from "ts/mr/lively/behaviors/LCommonBehavior";
import { LDecisionBehavior } from "ts/mr/lively/behaviors/LDecisionBehavior";
import { LUnitBehavior } from "ts/mr/lively/behaviors/LUnitBehavior";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LItemUserBehavior } from "ts/mr/lively/behaviors/LItemUserBehavior";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";
import { LExitPointBehavior } from "ts/mr/lively/behaviors/LExitPointBehavior";
import { LEnemyBehavior } from "ts/mr/lively/behaviors/LEnemyBehavior";
import { LActorBehavior } from "ts/mr/lively/behaviors/LActorBehavior";
import { LItemBehavior } from "ts/mr/lively/behaviors/LItemBehavior";
import { LEntryPointBehavior } from "ts/mr/lively/behaviors/LEntryPointBehavior";
import { LGenericRMMZStateBehavior } from "ts/mr/lively/states/LGenericRMMZStateBehavior";
import { LItemImitatorBehavior } from "ts/mr/lively/behaviors/LItemImitatorBehavior";
import { LIllusionStateBehavior } from "ts/mr/lively/states/LIllusionStateBehavior";
import { LGrabFootBehavior } from "../lively/abilities/LGrabFootBehavior";
import { DBehaviorInstantiation } from "../data/DEntityProperties";
import { LEquipmentBehavior } from "../lively/behaviors/LEquipmentBehavior";
import { LRevivalItemBehavior } from "../lively/behaviors/LRevivalItemBehavior";
import { LItemStandingBehavior } from "../lively/states/LItemStandingState";
import { LSelfExplosionBehavior } from "../lively/behaviors/LSelfExplosionBehavior";

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
        { fullName: "LEquipmentBehavior", friendlyName: "Equipment", create: () => new LEquipmentBehavior() },
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
        { fullName: "LGrabFootBehavior", friendlyName: "FootBehavior", create: () => new LGrabFootBehavior() },
        { fullName: "LRevivalItemBehavior", friendlyName: "RevivalItem", create: () => new LRevivalItemBehavior() },
        { fullName: "LItemStandingBehavior", friendlyName: "ItemStanding", create: () => new LItemStandingBehavior() },
        
        
        { fullName: "LKnockbackBehavior", friendlyName: "Knockback", create: () => new LKnockbackBehavior() },
        { fullName: "LSelfExplosionBehavior", friendlyName: "SelfExplosion", create: () => new LSelfExplosionBehavior() },
        
        { fullName: "LDebugMoveRightBehavior", friendlyName: "DebugMoveRight", create: () => new LDebugMoveRightBehavior() },
    ];
    
    
    public static register<T extends LBehavior>(fullName: string, friendlyName: string , ctor: { new(...args: any[]): T }): void {
        this._behaviorEntries.push({
            fullName: fullName,
            friendlyName: friendlyName,
            create: () => new ctor(),
        });
    }
    
    public static attachBehaviors(entity: LEntity, behaviors: DBehaviorInstantiation[]): void {
        behaviors.forEach(info => {
            const b = this.createBehavior(info.name);
            if (b)
                entity._addBehavior(b);
            else
                throw new Error(`Behavior "${info.name}" that you tried to add to the entity "${entity._name}" is invalid.`);
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
            return undefined;
        }
    }
}

