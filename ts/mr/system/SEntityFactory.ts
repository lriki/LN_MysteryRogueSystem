import { LEntity } from "../lively/LEntity";
import { MRData } from "../data/MRData";
import { MRLively } from "../lively/MRLively";
import { LDecisionBehavior } from "../lively/behaviors/LDecisionBehavior";
import { LUnitBehavior } from "../lively/behaviors/LUnitBehavior";
import { LExitPointBehavior } from "ts/mr/lively/behaviors/LExitPointBehavior";
import { LItemUserBehavior } from "ts/mr/lively/behaviors/LItemUserBehavior";
import { LCommonBehavior } from "ts/mr/lively/behaviors/LCommonBehavior";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LItemBehavior } from "ts/mr/lively/behaviors/LItemBehavior";
import { LTrapBehavior } from "ts/mr/lively/behaviors/LTrapBehavior";
import { LEnemyBehavior } from "ts/mr/lively/behaviors/LEnemyBehavior";
import { LEquipmentBehavior } from "ts/mr/lively/behaviors/LEquipmentBehavior";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";
import { DEntity, DEntityId } from "ts/mr/data/DEntity";
import { LEntryPointBehavior } from "ts/mr/lively/behaviors/LEntryPointBehavior";
import { LActorBehavior } from "ts/mr/lively/behaviors/LActorBehavior";
import { SBehaviorFactory } from "./SBehaviorFactory";
//import { LEaterBehavior } from "ts/mr/lively/behaviors/actors/LEaterBehavior";
import {  DItemDataId } from "ts/mr/data/DItem";
import { LProjectileBehavior } from "ts/mr/lively/behaviors/activities/LProjectileBehavior";
import { LSurvivorBehavior } from "ts/mr/lively/behaviors/LSurvivorBehavior";
import { LEntityDivisionBehavior } from "ts/mr/lively/abilities/LEntityDivisionBehavior";
import { LSanctuaryBehavior } from "ts/mr/lively/behaviors/LSanctuaryBehavior";
import { LGlueToGroundBehavior } from "ts/mr/lively/behaviors/LGlueToGroundBehavior";
import { DPrefab } from "ts/mr/data/DPrefab";
import { DTroop } from "ts/mr/data/DTroop";
import { DStateId } from "ts/mr/data/DState";
import { UMovement } from "../utility/UMovement";
import { LFlockBehavior } from "ts/mr/lively/behaviors/LFlockBehavior";
import { assert } from "ts/mr/Common";
import { LStorageBehavior } from "ts/mr/lively/behaviors/LStorageBehavior";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { LRatedRandomAIBehavior } from "ts/mr/lively/behaviors/LRatedRandomAIBehavior";
import { MRSystem } from "./MRSystem";
import { LGrabFootBehavior } from "../lively/abilities/LGrabFootBehavior";
import { LItemThiefBehavior } from "../lively/behaviors/LItemThiefBehavior";
import { LShopkeeperBehavior } from "../lively/behaviors/LShopkeeperBehavior";
import { LGoldBehavior } from "../lively/behaviors/LGoldBehavior";
import { LGoldThiefBehavior } from "../lively/behaviors/LGoldThiefBehavior";
import { LParamBehavior } from "../lively/behaviors/LParamBehavior";
import { LEscapeAI } from "../lively/ai/LEscapeAI";
import { LEscapeBehavior } from "../lively/behaviors/LEscapeBehavior";
import { LStumblePreventionBehavior } from "../lively/behaviors/LPreventionBehavior";
import { LActivityCharmBehavior } from "../lively/behaviors/LActivityCharmBehavior";
import { LExperienceBehavior } from "../lively/behaviors/LExperienceBehavior";
import { LRaceBehavior } from "../lively/behaviors/LRaceBehavior";
import { DEntityCategory } from "../data/DEntityCategory";
import { LMap } from "../lively/LMap";
import { DEntityCreateInfo } from "../data/DSpawner";
import { LBehavior } from "../lively/behaviors/LBehavior";
import { DBehaviorId } from "../data/DCommon";
import { DBehaviorProps } from "../data/DBehavior";
import { LCrackedBehavior } from "../lively/behaviors/LCrackedBehavior";

// export class DBehaviorInstantiationList {
//     private readonly _list: DBehaviorInstantiation[] = [];
    
//     public addBehavior(fullName: string, params: any): void {
//         const entry = this._list.find(e => e.name === fullName);
//         if (entry) {
//             entry.params = params;
//             return;
//         }
//         else {
//             this._list.push(new DBehaviorInstantiation(fullName, params));
//         }

//         this._list.push(new DBehaviorInstantiation(name, params));
//     }
// }


interface SBehaviorInstantiation {
    behaviorId: DBehaviorId;
    params: DBehaviorProps | undefined;
}

export class SEntityBuilder {
    private readonly _baseList: SBehaviorInstantiation[] = [];

    public readonly data: DEntity;

    public constructor(data: DEntity) {
        this.data = data;
        //this.setupCommon();
    }

    public addBaseBehavior<T extends LBehavior>(ctor: { new(...args: any[]): T }, params: DBehaviorProps | undefined = undefined): this {
        const data = MRData.getBehavior(ctor.name);
        const entry = this._baseList.find(e => e.behaviorId === data.id);
        if (entry) {
            if (params) {
                if (entry.params) {
                    assert(entry.params.code === params.code);
                    Object.assign(entry.params, params);
                }
                else {
                    entry.params = {...params};
                }
            }
        }
        else {
            this._baseList.push({ behaviorId: data.id, params: params });
        }
        return this;
    }

    /**
     * 新しい Entity を作成し、World に追加する
     */
    public spawn(): LEntity {
        const entity = MRLively.world.spawnEntity(this.data.id);
        this.build(entity);
        return entity;
    }

    /**
     * 既存の Entity に対して構築処理を実行する。
     */
    public build(entity: LEntity): void {
        assert(entity.behaviorIds().length === 0);

        // Merge
        const behaviorList = [...this._baseList];
        for (const entryInstantiation of this.data.entity.behaviors) {
            const entry = behaviorList.find(e => e.behaviorId == entryInstantiation.behaviorId);
            if (entry) {
                if (entryInstantiation.props) {
                    if (entry.params) {
                        assert(entry.params.code === entryInstantiation.props.code);
                        Object.assign(entry.params, entryInstantiation.props);
                    }
                    else {
                        entry.params = {...entryInstantiation.props};
                    }
                }
            }
            else {
                behaviorList.push({ behaviorId: entryInstantiation.behaviorId, params: entryInstantiation.props });
            }
        }

        // Behavior を作成
        const initPairs: [LBehavior, SBehaviorInstantiation][] = [];
        for (const entry of behaviorList) {
            const data = MRData.behavior[entry.behaviorId];
            if (!entity.findEntityBehaviorBy(b => b.fullName == data.fullName)) {
                const behavior = SBehaviorFactory.createBehaviorInstance(data.fullName);
                if (!behavior) {
                    throw new Error(`Behavior ${data.fullName} not found.`);
                }
                entity.addBehavior(behavior);
                initPairs.push([behavior, entry]);
            }
        }

        // 最後に onInitialized を呼ぶ
        for (const [behavior, entry] of initPairs) {
            behavior.onInitialized(entity, entry.params ?? {code: "Unknown"});
        }

        MRSystem.ext.onNewEntity(entity, entity.data);
    }


    // public addBaseBehavior(name: string): this {
    //     this._baseList.push({ name: name });
    //     return this;
    // }

    // public addBaseBehavior(name: string): this {
    //     this._baseList.push({ name: name });
    //     return this;
    // }
    
    private setupCommon(): void {
        this.addBaseBehavior(LCommonBehavior);
        this.addBaseBehavior(LProjectileBehavior);
        this.addBaseBehavior(LItemBehavior);
    }

    public setupActor(): this {
        this.setupCommon();
        this.addBaseBehavior(LDecisionBehavior);
        this.addBaseBehavior(LUnitBehavior, { code: "Unit", factionId: MRData.system.factions.player });
        this.addBaseBehavior(LInventoryBehavior);
        this.addBaseBehavior(LEquipmentUserBehavior);
        this.addBaseBehavior(LExperienceBehavior);
        this.addBaseBehavior(LActorBehavior);    // この時点の装備品などで初期パラメータを作るので、後ろに追加しておく
        //this.addBaseBehavior(LEaterBehavior);
        this.addBaseBehavior(LSurvivorBehavior);
        return this;
    }
    
    public setupMonster(enemyEntityData: DEntity): this {
        this.setupCommon();
        this.addBaseBehavior(LDecisionBehavior);
        this.addBaseBehavior(LUnitBehavior, { code: "Unit", factionId: enemyEntityData.factionId });
        this.addBaseBehavior(LInventoryBehavior);
        this.addBaseBehavior(LEnemyBehavior);
        this.addBaseBehavior(LRaceBehavior);
        this.setupDirectly_Enemy(enemyEntityData);
        return this;
    }
    
    public setupItem(): this {
        this.setupCommon();
        const entityData = this.data;

        if (entityData.entity.kindId == MRBasics.entityCategories.WeaponKindId ||
            entityData.entity.kindId == MRBasics.entityCategories.ShieldKindId) {
            this.addBaseBehavior(LEquipmentBehavior);
        }

        // for (const name of entityData.entity.abilityNames) {
        //     const data = MRData.abilities.find(x => x.key == name);
        //     if (!data) throw new Error(`Ability "${name}" not found.`);
        //     e.addAbility(data.id);
        // }

        this.setupDirectly_Item(entityData);
        return this;
    }
    
    public setupTrap(itemId: DItemDataId): this {
        const item = MRData.itemData(itemId);
        this.setupCommon();
        this.addBaseBehavior(LTrapBehavior);
        return this;
    }
    
    public setupEntryPoint(): this {
        this.addBaseBehavior(LProjectileBehavior);
        this.addBaseBehavior(LEntryPointBehavior);
        return this;
    }

    public setupExitPoint(): this {
        this.addBaseBehavior(LProjectileBehavior);
        this.addBaseBehavior(LExitPointBehavior);
        return this;
    }

    public setupOrnament(prefab: DPrefab): this {
        this.addBaseBehavior(LProjectileBehavior);
        return this;
    }

    
    // NOTE: エディタ側である程度カスタマイズできるように Note の設計を進めていたのだが、
    // どのぐらいの粒度で Behabior を分けるべきなのか現時点では決められなかった。(Activity単位がいいのか、Ability単位か、機能単位か)
    // そのためここで直定義して一通り作ってみた後、再検討する。
    private setupDirectly_Item(entityData: DEntity) {
        switch (entityData.entity.key) {
            case "kEntity_聖域の巻物A":
                this.addBaseBehavior(LSanctuaryBehavior);
                this.addBaseBehavior(LGlueToGroundBehavior);
                break;
            case "kEntity_保存の壺A":
                this.addBaseBehavior(LInventoryBehavior);
                this.addBaseBehavior(LStorageBehavior);
                this.addBaseBehavior(LCrackedBehavior);
                break;
            case "kEntity_GoldA":
                this.addBaseBehavior(LGoldBehavior);
                break;
            case "kEntity_転ばぬ先の杖A":
                this.addBaseBehavior(LStumblePreventionBehavior);
                break;
            case "kEntity_RevivalGrassA":
                this.addBaseBehavior(LActivityCharmBehavior);
                break;
        }
    }

    private setupDirectly_Enemy(entityData: DEntity) {
        switch (entityData.entity.key) {
            case "kEnemy_バットA":
            case "kEnemy_黒幕バットA":
                this.addBaseBehavior(LRatedRandomAIBehavior);
                break;
            case "kEnemy_ウルフA":
                this.addBaseBehavior(LParamBehavior, { code: "Param", paramId: MRBasics.params.agi, value: 100 });
                break;
            case "kEnemy_苗色スライムA":
                this.addBaseBehavior(LEntityDivisionBehavior);
                break;
            case "kEnemy_軍隊ウルフA":
                this.addBaseBehavior(LFlockBehavior);
                break;
            case "kEnemy_バインドゴーレムA":
                this.addBaseBehavior(LGrabFootBehavior);
                break;
                
            case "kEnemy_NPC汎用A":
                this.addBaseBehavior(LUnitBehavior, { code: "Unit", factionId: MRData.system.factions.neutral});   // overwrite
                break;
            case "kEnemy_瑠璃猫A":
                this.addBaseBehavior(LItemThiefBehavior);
                break;
            case "kEnemy_小金猫A":
                this.addBaseBehavior(LGoldThiefBehavior);
                break;
            case "kEnemy_金剛猫A":
                this.addBaseBehavior(LEscapeBehavior);
                this.addBaseBehavior(LParamBehavior, { code: "Param", paramId: MRBasics.params.agi, value: 100 });
                break;
            case "kEnemy_店主A":
                this.addBaseBehavior(LShopkeeperBehavior);
                break;
        }
    }
}


export class SEntityFactory {
    public static newActor(entityId: DEntityId): LEntity {
       return new SEntityBuilder(MRData.entities[entityId])
            .setupActor()
            .spawn();
    }

    // private static setupCommon(e: LEntity): void {
    //     e.addBehavior(LCommonBehavior);
    //     e.addBehavior(LProjectileBehavior);
    //     e.addBehavior(LItemBehavior);
    // }

    // public static newMonster(enemyEntityData: DEntity): LEntity {
    //     const e = REGame.world.spawnEntity(enemyEntityData.id);
    //     this.buildMonster(e, enemyEntityData);
    //     return e;
    // }
    

    public static newBasicExitPoint(): LEntity {
        return new SEntityBuilder(MRData.getEntity("kEntity_ExitPointA"))
             .setupExitPoint()
             .spawn();
    }

    // public static newEntryPoint(entityId: DEntityId): LEntity {
    //     assert(REData.getEntity("kEntity_EntryPointA").id == entityId);
    //     const e = REGame.world.spawnEntity(entityId);
    //     this.buildEntryPoint(e);
    //     return e;
    // }


    public static newEntity(createInfo: DEntityCreateInfo, floorId?: LFloorId): LEntity {
        const entityData = MRData.entities[createInfo.entityId];
        const entity = MRLively.world.spawnEntity(entityData.id);
        this.buildEntity(entity);

        // ステート追加
        for (const stateId of createInfo.stateIds) {
            entity.addState(stateId);
        }

        entity._name = createInfo.debugName;

        if (createInfo.stackCount !== undefined) {
            entity._stackCount = createInfo.stackCount;
        }
        else if (entityData.initialStackCount !== undefined) {
            entity._stackCount = MRLively.world.random().nextIntWithMinMax(entityData.initialStackCount.minValue, entityData.initialStackCount.maxValue + 1);
        }
        else {
            entity._stackCount = 1;
        }

        // 個体識別済みチェック
        if (floorId) {
            if (floorId.landData.checkIdentifiedEntity(entity.kindData())) {
                entity.setIndividualIdentified(true);
            }
        }
        

        
        {
            const goldBehavior = entity.findEntityBehavior(LGoldBehavior);
            if (goldBehavior) {
                goldBehavior.setGold(createInfo.gold);
            }
        }

        return entity;
    }

    public static buildEntity(entity: LEntity) {
        const dataId = entity.dataId;
        assert(dataId > 0);
        const entityData = MRData.entities[dataId];
        const prefab = MRData.prefabs[entityData.prefabId];
        const builder = new SEntityBuilder(entityData);
        
        if (DEntityCategory.isMonster(entityData)) {
            builder.setupMonster(entityData);
        }
        else if (DEntityCategory.isTrap(entityData)) {
            builder.setupTrap(entityData.item().id);
        }
        else if (DEntityCategory.isEntryPoint(entityData)) {
            builder.setupEntryPoint();
        }
        else if (DEntityCategory.isExitPoint(entityData)) {
            builder.setupExitPoint();
        }
        else if (DEntityCategory.isOrnament(entityData)) {
            builder.setupOrnament(prefab);
        }
        else {
            builder.setupItem();
        }

        builder.build(entity);
    }

    public static spawnTroopAndMembers(map: LMap, troop: DTroop, mx: number, my: number, stateIds: DStateId[]): LEntity[] {
        const result = [];
        const party = MRLively.world.newParty();

        for (const entityId of troop.members) {
            const entity = this.newEntity(DEntityCreateInfo.makeSingle(entityId, stateIds), map.floorId());
            party.addMember(entity);
            result.push(entity);

            const block = UMovement.selectNearbyLocatableBlock(map, MRLively.world.random(), mx, my, entity.getHomeLayer(), entity);
            if (block) {
                MRLively.world.transferEntity(entity, map.floorId(), block.mx, block.my);
            }
            else {
                // 配置できないなら無理に出さない
            }
        }

        return result;
    }

}


