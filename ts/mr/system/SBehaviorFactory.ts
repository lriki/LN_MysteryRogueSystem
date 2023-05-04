import { LEntity } from "../lively/entity/LEntity";
import { LBehavior } from "ts/mr/lively/behaviors/LBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { LDebugMoveRightBehavior } from "ts/mr/lively/states/LDebugMoveRight";
import { LNapStateBehavior } from "ts/mr/lively/states/LNapStateBehavior";
import { LKnockbackBehavior } from "ts/mr/lively/abilities/LKnockbackBehavior";
import { LCommonBehavior } from "ts/mr/lively/behaviors/LCommonBehavior";
import { LDecisionBehavior } from "ts/mr/lively/behaviors/LDecisionBehavior";
import { LUnitBehavior } from "ts/mr/lively/behaviors/LUnitBehavior";
import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
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
import { DBehaviorInstantiation } from "../data/DBehavior";
import { LEquipmentBehavior } from "../lively/behaviors/LEquipmentBehavior";
import { LRevivalItemBehavior } from "../lively/behaviors/LRevivalItemBehavior";
import { LItemStandingBehavior } from "../lively/states/LItemStandingState";
import { LSelfExplosionBehavior } from "../lively/behaviors/LSelfExplosionBehavior";
import { LProjectileBehavior } from "../lively/behaviors/activities/LProjectileBehavior";
import { LExperienceBehavior } from "../lively/behaviors/LExperienceBehavior";
//import { LEaterBehavior } from "../lively/behaviors/actors/LEaterBehavior";
import { LSurvivorBehavior } from "../lively/behaviors/LSurvivorBehavior";
import { LRaceBehavior } from "../lively/behaviors/LRaceBehavior";
import { LTrapBehavior } from "../lively/behaviors/LTrapBehavior";
import { LParamBehavior } from "../lively/behaviors/LParamBehavior";
import { LRatedRandomAIBehavior } from "../lively/behaviors/LRatedRandomAIBehavior";
import { LEntityDivisionBehavior } from "../lively/abilities/LEntityDivisionBehavior";
import { LSanctuaryBehavior } from "../lively/behaviors/LSanctuaryBehavior";
import { LGlueToGroundBehavior } from "../lively/behaviors/LGlueToGroundBehavior";
import { LStumblePreventionBehavior } from "../lively/behaviors/LPreventionBehavior";
import { LGoldThiefBehavior } from "../lively/behaviors/LGoldThiefBehavior";
import { LActivityCharmBehavior } from "../lively/behaviors/LActivityCharmBehavior";
import { LGoldBehavior } from "../lively/behaviors/LGoldBehavior";
import { LEscapeBehavior } from "../lively/behaviors/LEscapeBehavior";
import { LFlockBehavior } from "../lively/behaviors/LFlockBehavior";
import { LStorageBehavior } from "../lively/behaviors/LStorageBehavior";
import { LItemThiefBehavior } from "../lively/behaviors/LItemThiefBehavior";
import { LShopkeeperBehavior } from "../lively/behaviors/LShopkeeperBehavior";
import { LCrackedBehavior } from "../lively/behaviors/LCrackedBehavior";
import { assert } from "../Common";
import { MRData } from "../data/MRData";
import { DBehaviorId } from "../data/DCommon";

interface SBehaviorEntry {
    dataId: DBehaviorId,
    create: () => LBehavior;
};

export class SBehaviorManager {

    // Index is DBehaviorId.
    private static _behaviorEntries: (SBehaviorEntry | undefined)[] = [];
    
    /**
     * ゲーム開始時の初期化処理。DB にも登録するので、繰り返し呼び出してはならない。
     * @param fullName 
     */
    public static initialize(): void {
        this._behaviorEntries = [];
        this.register("kBehavior_Common", "LCommonBehavior", "Common", LCommonBehavior);
        this.register("kBehavior_Decision", "LDecisionBehavior", "Decision", LDecisionBehavior);
        this.register("kBehavior_Unit", "LUnitBehavior", "Unit", LUnitBehavior);
        this.register("kBehavior_Inventory", "LInventoryBehavior", "Inventory", LInventoryBehavior);
        this.register("kBehavior_ItemUser", "LItemUserBehavior", "_ItemUser", LItemUserBehavior);
        this.register("kBehavior_Equipment", "LEquipmentBehavior", "Equipment", LEquipmentBehavior);
        this.register("kBehavior_EquipmentUser", "LEquipmentUserBehavior", "_EquipmentUser", LEquipmentUserBehavior);
        this.register("kBehavior_Actor", "LActorBehavior", "_Actor", LActorBehavior);
        this.register("kBehavior_ExitPoint", "LExitPointBehavior", "_ExitPoint", LExitPointBehavior);
        this.register("kBehavior_EntryPoint", "LEntryPointBehavior", "_EntryPoint", LEntryPointBehavior);
        this.register("kBehavior_Enemy", "LEnemyBehavior", "_Enemy", LEnemyBehavior);
        this.register("kBehavior_GenericRMMZState", "LGenericRMMZStateBehavior", "_GenericRMMZState", LGenericRMMZStateBehavior);
        this.register("kBehavior_Item", "LItemBehavior", "_Item", LItemBehavior);
        this.register("kBehavior_NapState", "LNapStateBehavior", "NapState", LNapStateBehavior);
        this.register("kBehavior_ItemImitator", "LItemImitatorBehavior", "ItemImitator", LItemImitatorBehavior);
        this.register("kBehavior_IllusionState", "LIllusionStateBehavior", "IllusionState", LIllusionStateBehavior);
        this.register("kBehavior_GrabFoot", "LGrabFootBehavior", "FootBehavior", LGrabFootBehavior);
        this.register("kBehavior_RevivalItem", "LRevivalItemBehavior", "RevivalItem", LRevivalItemBehavior);
        this.register("kBehavior_ItemStanding", "LItemStandingBehavior", "ItemStanding", LItemStandingBehavior);
        this.register("kBehavior_Projectile", "LProjectileBehavior", "Projectile", LProjectileBehavior);
        this.register("kBehavior_Experience", "LExperienceBehavior", "Experience", LExperienceBehavior);
        this.register("kBehavior_Eater", "LEaterBehavior", "Eater", LActorBehavior);
        this.register("kBehavior_Survivor", "LSurvivorBehavior", "Survivor", LSurvivorBehavior);
        this.register("kBehavior_Race", "LRaceBehavior", "Race", LRaceBehavior);
        this.register("kBehavior_Trap", "LTrapBehavior", "Trap", LTrapBehavior);
        this.register("kBehavior_Param", "LParamBehavior", "Param", LParamBehavior);
        this.register("kBehavior_RatedRandomAI", "LRatedRandomAIBehavior", "RatedRandomAI", LRatedRandomAIBehavior);
        this.register("kBehavior_EntityDivision", "LEntityDivisionBehavior", "EntityDivision", LEntityDivisionBehavior);
        this.register("kBehavior_Sanctuary", "LSanctuaryBehavior", "Sanctuary", LSanctuaryBehavior);
        this.register("kBehavior_GlueToGround", "LGlueToGroundBehavior", "GlueToGround", LGlueToGroundBehavior);
        this.register("kBehavior_StumblePrevention", "LStumblePreventionBehavior", "StumblePrevention", LStumblePreventionBehavior);
        this.register("kBehavior_GoldThief", "LGoldThiefBehavior", "GoldThief", LGoldThiefBehavior);
        this.register("kBehavior_ActivityCharm", "LActivityCharmBehavior", "ActivityCharm", LActivityCharmBehavior);
        this.register("kBehavior_Gold", "LGoldBehavior", "Gold", LGoldBehavior);
        this.register("kBehavior_Escape", "LEscapeBehavior", "Escape", LEscapeBehavior);
        this.register("kBehavior_Flock", "LFlockBehavior", "Flock", LFlockBehavior);
        this.register("kBehavior_Storage", "LStorageBehavior", "Storage", LStorageBehavior);
        this.register("kBehavior_ItemThief", "LItemThiefBehavior", "ItemThief", LItemThiefBehavior);
        this.register("kBehavior_Shopkeeper", "LShopkeeperBehavior", "Shopkeeper", LShopkeeperBehavior);
        this.register("kBehavior_CrackedBehavior", "LCrackedBehavior", "CrackedBehavior", LCrackedBehavior);
        this.register("kBehavior_Knockback", "LKnockbackBehavior", "Knockback", LKnockbackBehavior);
        this.register("kBehavior_SelfExplosion", "LSelfExplosionBehavior", "SelfExplosion", LSelfExplosionBehavior);
        this.register("kBehavior_DebugMoveRight", "LDebugMoveRightBehavior", "DebugMoveRight", LDebugMoveRightBehavior);
    }
    
    public static register<T extends LBehavior>(key: string, fullName: string, friendlyName: string , ctor: { new(...args: any[]): T }): void {
        const data = MRData.getBehavior(key);//MRData.newBehavior(key, fullName, friendlyName);
        assert(this._behaviorEntries[data.id] === undefined);
        this._behaviorEntries[data.id] = {
            dataId: data.id,
            create: () => new ctor(),
        };
    }


    /**
     * プログラム内で Behavior を作成する際のユーティリティです。
     */
    public static addBehavior<T extends LBehavior>(target: LEntity, ctor: { new(...args: any[]): T }, ...args: any[]): T {
        const behavior = new ctor();
        (behavior as T).setup(...args);
        target.addBehavior(behavior);
        return behavior;
    }
    
    public static attachBehaviors(entity: LEntity, behaviors: DBehaviorInstantiation[]): void {
        behaviors.forEach(info => {
            const b = this.createBehavior(info.data.fullName);
            if (b)
                entity._addBehavior(b);
            else
                throw new Error(`Behavior "${info.data.fullName}" that you tried to add to the entity "${entity._name}" is invalid.`);
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
        MRLively.world._registerObject(b);
        return b;
    }

    public static createBehaviorInstance(name: string): LBehavior | undefined {
        const e = this._behaviorEntries.find(x => {
            if (!x) return false;
            const data = MRData.behavior[x.dataId];
            return data.fullName == name || data.friendlyName == name;
        });
        if (e) {
            return e.create();
        }
        else {
            return undefined;
        }
    }
}

