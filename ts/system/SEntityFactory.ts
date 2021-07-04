import { LEntity } from "../objects/LEntity";
import { REData } from "../data/REData";
import { REGame } from "../objects/REGame";
import { LDecisionBehavior } from "../objects/behaviors/LDecisionBehavior";
import { LUnitBehavior } from "../objects/behaviors/LUnitBehavior";
import { LExitPointBehavior } from "ts/objects/behaviors/LExitPointBehavior";
import { LItemUserBehavior } from "ts/objects/behaviors/LItemUserBehavior";
import { LCommonBehavior } from "ts/objects/behaviors/LCommonBehavior";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { LItemBehavior } from "ts/objects/behaviors/LItemBehavior";
import { LTrapBehavior } from "ts/objects/behaviors/LTrapBehavior";
import { LEnemyBehavior } from "ts/objects/behaviors/LEnemyBehavior";
import { LEquipmentBehavior } from "ts/objects/behaviors/LEquipmentBehavior";
import { LEquipmentUserBehavior } from "ts/objects/behaviors/LEquipmentUserBehavior";
import { LMagicBulletBehavior } from "ts/objects/behaviors/LMagicBulletBehavior";
import { DEntity, DEntityId, DEntityCreateInfo } from "ts/data/DEntity";
import { LEntryPointBehavior } from "ts/objects/behaviors/LEntryPointBehavior";
import { LActorBehavior } from "ts/objects/behaviors/LActorBehavior";
import { SBehaviorFactory } from "./SBehaviorFactory";
import { LEaterBehavior } from "ts/objects/behaviors/actors/LEaterBehavior";
import { DItem, DItemDataId } from "ts/data/DItem";
import { LItemBehavior_Grass1 } from "ts/objects/behaviors/items/LItemBehavior_Grass1";
import { LProjectableBehavior } from "ts/objects/behaviors/activities/LProjectableBehavior";
import { LSurvivorBehavior } from "ts/objects/behaviors/LSurvivorBehavior";
import { LEntityDivisionBehavior } from "ts/objects/abilities/LEntityDivisionBehavior";
import { LSanctuaryBehavior } from "ts/objects/behaviors/LSanctuaryBehavior";
import { LClingFloorBehavior } from "ts/objects/behaviors/LClingFloorBehavior";
import { DPrefab, DPrefabDataSource, DPrefabId } from "ts/data/DPrefab";
import { DEnemy, DEnemyId } from "ts/data/DEnemy";
import { LItemImitatorBehavior } from "ts/objects/behaviors/LItemImitatorBehavior";
import { DTroop } from "ts/data/DTroop";
import { LParty } from "ts/objects/LParty";
import { DStateId } from "ts/data/DState";
import { UMovement } from "../usecases/UMovement";
import { LFlockBehavior } from "ts/objects/behaviors/LFlockBehavior";
import { assert } from "ts/Common";

export class SEntityFactory {
    public static newActor(entityId: DEntityId): LEntity {
        const e = REGame.world.spawnEntity(entityId);
        this.buildActor(e);
        return e;
    }

    public static buildActor(e: LEntity): void {
        assert(e.behaviorIds().length === 0);
        e.addBehavior(LCommonBehavior);
        e.addBehavior(LProjectableBehavior);
        e.addBehavior(LDecisionBehavior);
        e.addBehavior(LUnitBehavior).setFactionId(REData.system.factions.player);
        e.addBehavior(LInventoryBehavior);
        e.addBehavior(LItemUserBehavior);
        e.addBehavior(LEquipmentUserBehavior);
        e.addBehavior(LActorBehavior);    // この時点の装備品などで初期パラメータを作るので、後ろに追加しておく
        e.addBehavior(LEaterBehavior);
        e.addBehavior(LSurvivorBehavior);
    }

    public static newMonster(enemyEntityData: DEntity): LEntity {
        const e = REGame.world.spawnEntity(enemyEntityData.id);
        this.buildMonster(e, enemyEntityData);
        return e;
    }
    
    public static buildMonster(e: LEntity, enemyEntityData: DEntity): void {
        e.addBehavior(LCommonBehavior);
        e.addBehavior(LProjectableBehavior);
        e.addBehavior(LDecisionBehavior);
        e.addBehavior(LUnitBehavior).setFactionId(REData.system.factions.enemy);
        e.addBehavior(LEnemyBehavior);
        this.setupDirectly_Enemy(e, enemyEntityData);
    }

    public static newItem(itemId: DItemDataId): LEntity {
        const item = REData.itemData(itemId);
        const e = REGame.world.spawnEntity(item.entityId);
        this.buildItem(e, itemId);
        return e;
    }
    
    public static buildItem(e: LEntity, itemId: DItemDataId): void {
        const item = REData.itemData(itemId);
        e.addBehavior(LCommonBehavior);
        e.addBehavior(LProjectableBehavior);
        e.addBehavior(LItemBehavior);

        const entityData = REData.entities[item.entityId]

        if (entityData.entity.kind == "Weapon" ||
            entityData.entity.kind == "Shield") {
            e.addBehavior(LEquipmentBehavior);
        }

        SBehaviorFactory.attachBehaviors(e, entityData.entity.behaviorNames);

        for (const name of entityData.entity.abilityNames) {
            const data = REData.abilities.find(x => x.key == name);
            if (!data) throw new Error(`Ability "${name}" not found.`);
            e.addAbility(data.id);
        }

        //e.addAbility(REData.abilities[1].id);  // TODO: Test
        this.setupDirectly_Item(e, entityData);
    }

    public static newTrap(itemId: DItemDataId): LEntity {
        const item = REData.itemData(itemId);
        const e = REGame.world.spawnEntity(item.entityId);
        this.buildTrap(e, itemId);
        return e;
    }
    
    public static buildTrap(e: LEntity, itemId: DItemDataId): void {
        const item = REData.itemData(itemId);
        e.addBehavior(LCommonBehavior);
        e.addBehavior(LProjectableBehavior);
        e.addBehavior(LItemBehavior);
        e.addBehavior(LTrapBehavior);
    }

    public static newEntryPoint(): LEntity {
        const e = REGame.world.spawnEntity(REData.getEntity("kEntryPoint").id);
        this.buildEntryPoint(e);
        return e;
    }

    public static buildEntryPoint(e: LEntity): void {
        e.addBehavior(LProjectableBehavior);
        e.addBehavior(LEntryPointBehavior);
    }

    public static newExitPoint(): LEntity {
        const e = REGame.world.spawnEntity(REData.getEntity("kExitPoint").id);
        this.buildExitPoint(e);
        return e;
    }

    public static buildExitPoint(e: LEntity): void {
        e.addBehavior(LProjectableBehavior);
        e.addBehavior(LExitPointBehavior);
    }

    public static newMagicBullet(ownerItem: LEntity): LEntity {
        const e = REGame.world.spawnEntity(REData.getEntity("kSystem_MagicBullet").id);
        this.buildMagicBullet(e, ownerItem);
        return e;
    }

    public static buildMagicBullet(e: LEntity, ownerItem: LEntity): void {
        e.addBehavior(LMagicBulletBehavior, ownerItem);
    }

    public static newOrnament(entityId: DEntityId, prefab: DPrefab): LEntity {
        const e = REGame.world.spawnEntity(entityId);
        this.buildOrnament(e, prefab);
        return e;
    }

    public static buildOrnament(e: LEntity, prefab: DPrefab): void {
        e.addBehavior(LProjectableBehavior);
    }

    public static newEntity(data: DEntityCreateInfo): LEntity {
        const entityData = REData.entities[data.entityId];
        const prefab = REData.prefabs[entityData.prefabId];
        let entity: LEntity;

        if (prefab.isEnemyKind()) {
            const entityId = REData.monsters[prefab.dataId];
            if (entityId)
                entity = SEntityFactory.newMonster(REData.entities[entityId]);
            else
                throw new Error("Invalid enemy key: " + prefab.key);
        }
        else if (prefab.isTrapKind()) {
            entity = this.newTrap(prefab.dataId);
        }
        else if (prefab.isItemKind()) {
            entity = this.newItem(prefab.dataId);
        }
        else if (prefab.isEntryPoint()) {
            entity = this.newEntryPoint();
        }
        else if (prefab.isExitPoint()) {
            entity = this.newExitPoint();
        }
        else if (prefab.dataSource = DPrefabDataSource.Ornament) {
            entity = this.newOrnament(data.entityId, prefab);
        }
        else {
            throw new Error("Not implemented.");
        }

        // ステート追加
        for (const stateId of data.stateIds) {
            entity.addState(stateId);
        }

        return entity;
    }

    public static buildEntity(entity: LEntity) {
        const dataId = entity.dataId();
        assert(dataId > 0);
        const entityData = REData.entities[dataId];
        const prefab = REData.prefabs[entityData.prefabId];
        
        if (prefab.isEnemyKind()) {
            const entityId = REData.monsters[prefab.dataId];
            if (entityId)
                this.buildMonster(entity, REData.entities[entityId]);
            else
                throw new Error("Invalid enemy key: " + prefab.key);
        }
        else if (prefab.isTrapKind()) {
            this.buildTrap(entity, prefab.dataId);
        }
        else if (prefab.isItemKind()) {
            this.buildItem(entity, prefab.dataId);
        }
        else if (prefab.isEntryPoint()) {
            this.buildEntryPoint(entity);
        }
        else if (prefab.isExitPoint()) {
            this.buildExitPoint(entity);
        }
        else if (prefab.dataSource = DPrefabDataSource.Ornament) {
            this.buildOrnament(entity, prefab);
        }
        else {
            throw new Error("Not implemented.");
        }
    }

    public static spawnTroopAndMembers(troop: DTroop, mx: number, my: number, stateIds: DStateId[]): void {
        const party = REGame.world.newParty();

        for (const entityId of troop.members) {
            const entity = this.newEntity(DEntityCreateInfo.makeSingle(entityId, stateIds));
            party.addMember(entity);
            const block = UMovement.selectNearbyLocatableBlock(REGame.world.random(), mx, my, entity.getHomeLayer());

            if (block) {
                REGame.world._transferEntity(entity, REGame.map.floorId(), block.x(), block.y());
            }
            else {
                // 配置できないなら無理に出さない
            }
        }
    }

    // NOTE: エディタ側である程度カスタマイズできるように Note の設計を進めていたのだが、
    // どのぐらいの粒度で Behabior を分けるべきなのか現時点では決められなかった。(Activity単位がいいのか、Ability単位か、機能単位か)
    // そのためここで直定義して一通り作ってみた後、再検討する。
    static setupDirectly_Item(entity: LEntity, entityData: DEntity) {
        switch (entityData.entity.key) {
            case "kキュアリーフ":
            case "kフレイムリーフ":
                entity.addBehavior(LItemBehavior_Grass1);
                break;
            case "kItem_サンクチュアリスクロール":
                entity.addBehavior(LSanctuaryBehavior);
                entity.addBehavior(LClingFloorBehavior);
                break;
        }
    }

    static setupDirectly_Enemy(entity: LEntity, entityData: DEntity) {
        switch (entityData.entity.key) {
            case "kEnemy_スピリットスライム":
                entity.addBehavior(LEntityDivisionBehavior);
                break;
            case "kEnemy_フロックウルフ":
                entity.addBehavior(LFlockBehavior);
                break;

        }

    }
}


