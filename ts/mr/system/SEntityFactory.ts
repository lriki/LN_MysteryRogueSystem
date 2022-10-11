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
import { DEntity, DEntityId, DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LEntryPointBehavior } from "ts/mr/lively/behaviors/LEntryPointBehavior";
import { LActorBehavior } from "ts/mr/lively/behaviors/LActorBehavior";
import { SBehaviorFactory } from "./SBehaviorFactory";
import { LEaterBehavior } from "ts/mr/lively/behaviors/actors/LEaterBehavior";
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
import { DEntityKind } from "../data/DEntityKind";

export class SEntityFactory {
    public static newActor(entityId: DEntityId): LEntity {
        const e = MRLively.world.spawnEntity(entityId);
        this.buildActor(e);
        return e;
    }

    private static setupCommon(e: LEntity): void {
        e.addBehavior(LCommonBehavior);
        e.addBehavior(LProjectileBehavior);
        e.addBehavior(LItemBehavior);
    }

    public static buildActor(e: LEntity): void {
        assert(e.behaviorIds().length === 0);
        this.setupCommon(e);
        e.addBehavior(LDecisionBehavior);
        e.addBehavior(LUnitBehavior).setFactionId(MRData.system.factions.player);
        e.addBehavior(LInventoryBehavior);
        //e.addBehavior(LItemUserBehavior);
        e.addBehavior(LEquipmentUserBehavior);
        e.addBehavior(LExperienceBehavior);
        e.addBehavior(LActorBehavior);    // この時点の装備品などで初期パラメータを作るので、後ろに追加しておく
        e.addBehavior(LEaterBehavior);
        e.addBehavior(LSurvivorBehavior);
    }

    // public static newMonster(enemyEntityData: DEntity): LEntity {
    //     const e = REGame.world.spawnEntity(enemyEntityData.id);
    //     this.buildMonster(e, enemyEntityData);
    //     return e;
    // }
    
    public static buildMonster(e: LEntity, enemyEntityData: DEntity): void {
        this.setupCommon(e);
        e.addBehavior(LDecisionBehavior);
        e.addBehavior(LUnitBehavior).setFactionId(enemyEntityData.factionId);
        e.addBehavior(LInventoryBehavior);
        //e.addBehavior(LExperiencedBehavior);
        e.addBehavior(LEnemyBehavior);
        e.addBehavior(LRaceBehavior);
        SBehaviorFactory.attachBehaviors(e, enemyEntityData.entity.behaviors);
        this.setupDirectly_Enemy(e, enemyEntityData);
    }
    
    public static buildItem(e: LEntity): void {
        this.setupCommon(e);
        const entityData = e.data;

        if (entityData.entity.kindId == MRBasics.entityKinds.WeaponKindId ||
            entityData.entity.kindId == MRBasics.entityKinds.ShieldKindId) {
            e.addBehavior(LEquipmentBehavior);
        }

        SBehaviorFactory.attachBehaviors(e, entityData.entity.behaviors);

        for (const name of entityData.entity.abilityNames) {
            const data = MRData.abilities.find(x => x.key == name);
            if (!data) throw new Error(`Ability "${name}" not found.`);
            e.addAbility(data.id);
        }

        //e.addAbility(REData.abilities[1].id);  // TODO: Test
        this.setupDirectly_Item(e, entityData);
    }

    // public static newTrap(itemId: DItemDataId): LEntity {
    //     const item = REData.itemData(itemId);
    //     const e = REGame.world.spawnEntity(item.entityId);
    //     this.buildTrap(e, itemId);
    //     return e;
    // }
    
    public static buildTrap(e: LEntity, itemId: DItemDataId): void {
        const item = MRData.itemData(itemId);
        this.setupCommon(e);
        e.addBehavior(LTrapBehavior);
    }

    public static newBasicExitPoint(): LEntity {
        const e = MRLively.world.spawnEntity(MRData.getEntity("kEntity_ExitPoint_A").id);
        this.buildExitPoint(e);
        return e;
    }

    // public static newEntryPoint(entityId: DEntityId): LEntity {
    //     assert(REData.getEntity("kEntity_EntryPoint_A").id == entityId);
    //     const e = REGame.world.spawnEntity(entityId);
    //     this.buildEntryPoint(e);
    //     return e;
    // }

    public static buildEntryPoint(e: LEntity): void {
        e.addBehavior(LProjectileBehavior);
        e.addBehavior(LEntryPointBehavior);
    }

    // public static newExitPoint(entityId: DEntityId): LEntity {
    //     assert(REData.getEntity("kEntity_ExitPoint_A").id == entityId);
    //     const e = REGame.world.spawnEntity(REData.getEntity("kEntity_ExitPoint_A").id);
    //     this.buildExitPoint(e);
    //     return e;
    // }

    public static buildExitPoint(e: LEntity): void {
        e.addBehavior(LProjectileBehavior);
        e.addBehavior(LExitPointBehavior);
    }

    // public static newOrnament(entityId: DEntityId, prefab: DPrefab): LEntity {
    //     const e = REGame.world.spawnEntity(entityId);
    //     this.buildOrnament(e, prefab);
    //     return e;
    // }

    public static buildOrnament(e: LEntity, prefab: DPrefab): void {
        e.addBehavior(LProjectileBehavior);
    }

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
            if (floorId.landData().checkIdentifiedEntity(entity.kindData())) {
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
        
        if (DEntityKind.isMonster(entityData)) {
            this.buildMonster(entity, entityData);
        }
        else if (DEntityKind.isTrap(entityData)) {
            this.buildTrap(entity, entityData.item().id);
        }
        else if (DEntityKind.isEntryPoint(entityData)) {
            this.buildEntryPoint(entity);
        }
        else if (DEntityKind.isExitPoint(entityData)) {
            this.buildExitPoint(entity);
        }
        else if (DEntityKind.isOrnament(entityData)) {
            this.buildOrnament(entity, prefab);
        }
        else {
            this.buildItem(entity);
        }
    }

    public static spawnTroopAndMembers(troop: DTroop, mx: number, my: number, stateIds: DStateId[]): LEntity[] {
        const result = [];
        const party = MRLively.world.newParty();

        for (const entityId of troop.members) {
            const entity = this.newEntity(DEntityCreateInfo.makeSingle(entityId, stateIds), MRLively.map.floorId());
            party.addMember(entity);
            result.push(entity);

            const block = UMovement.selectNearbyLocatableBlock(MRLively.world.random(), mx, my, entity.getHomeLayer(), entity);
            if (block) {
                MRLively.world.transferEntity(entity, MRLively.map.floorId(), block.mx, block.my);
            }
            else {
                // 配置できないなら無理に出さない
            }
        }

        return result;
    }

    // NOTE: エディタ側である程度カスタマイズできるように Note の設計を進めていたのだが、
    // どのぐらいの粒度で Behabior を分けるべきなのか現時点では決められなかった。(Activity単位がいいのか、Ability単位か、機能単位か)
    // そのためここで直定義して一通り作ってみた後、再検討する。
    static setupDirectly_Item(entity: LEntity, entityData: DEntity) {
        switch (entityData.entity.key) {
            case "kEntity_聖域の巻物_A":
                entity.addBehavior(LSanctuaryBehavior);
                entity.addBehavior(LGlueToGroundBehavior);
                break;
            // case "kEntity_突風の罠_A":
            //     break;
            case "kEntity_保存の壺_A":
                entity.addBehavior(LInventoryBehavior);
                entity.addBehavior(LStorageBehavior);
                break;
            case "kEntity_Gold_A":
                entity.addBehavior(LGoldBehavior);
                break;
            case "kEntity_転ばぬ先の杖_A":
                entity.addBehavior(LStumblePreventionBehavior);
                break;
            case "kEntity_RevivalGrass_A":
                entity.addBehavior(LActivityCharmBehavior);
                break;

                
        }
        MRSystem.ext.onNewEntity(entity, entityData);
    }

    static setupDirectly_Enemy(entity: LEntity, entityData: DEntity) {
        switch (entityData.entity.key) {
            case "kEnemy_バットA":
            case "kEnemy_黒幕バット_A":
                entity.addBehavior(LRatedRandomAIBehavior);
                break;
            case "kEnemy_ウルフA":
                entity.addBehavior(LParamBehavior).setParamBase(MRBasics.params.agi, 100);
                break;
            case "kEnemy_苗色スライム_A":
                entity.addBehavior(LEntityDivisionBehavior);
                break;
            case "kEnemy_軍隊ウルフ_A":
                entity.addBehavior(LFlockBehavior);
                break;
            case "kEnemy_バインドゴーレム_A":
                entity.addBehavior(LGrabFootBehavior);
                break;
                
            case "kEnemy_NPC汎用A":
                const b = entity.getEntityBehavior(LUnitBehavior);
                b.setFactionId(MRData.system.factions.neutral);
                break;
            case "kEnemy_瑠璃猫_A":
                entity.addBehavior(LItemThiefBehavior);
                break;
            case "kEnemy_小金猫_A":
                entity.addBehavior(LGoldThiefBehavior);
                break;
            case "kEnemy_金剛猫_A":
                entity.addBehavior(LEscapeBehavior);
                entity.addBehavior(LParamBehavior).setParamBase(MRBasics.params.agi, 100);
                break;
            case "kEnemy_店主A":
                entity.addBehavior(LShopkeeperBehavior);
                break;
        }
        MRSystem.ext.onNewEntity(entity, entityData);
    }
}


