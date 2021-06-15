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
import { DEntity } from "ts/data/DEntity";
import { LEntryPointBehavior } from "ts/objects/behaviors/LEntryPointBehavior";
import { LActorBehavior } from "ts/objects/behaviors/LActorBehavior";
import { SBehaviorFactory } from "./SBehaviorFactory";
import { LEaterBehavior } from "ts/objects/behaviors/actors/LEaterBehavior";
import { DItem } from "ts/data/DItem";
import { LItemBehavior_Grass1 } from "ts/objects/behaviors/items/LItemBehavior_Grass1";
import { LProjectableBehavior } from "ts/objects/behaviors/activities/LProjectableBehavior";
import { LSurvivorBehavior } from "ts/objects/behaviors/LSurvivorBehavior";
import { LEntityDivisionBehavior } from "ts/objects/abilities/LEntityDivisionBehavior";
import { LSanctuaryBehavior } from "ts/objects/behaviors/LSanctuaryBehavior";
import { LClingFloorBehavior } from "ts/objects/behaviors/LClingFloorBehavior";
import { DPrefab, DPrefabDataSource, DPrefabId } from "ts/data/DPrefab";

export class SEntityFactory {
    static newActor(actorId: number): LEntity {
        const e = REGame.world.spawnEntity();
        e.addBehavior(LCommonBehavior);
        e.addBehavior(LProjectableBehavior);
        e.addBehavior(LDecisionBehavior);
        e.addBehavior(LUnitBehavior).setFactionId(REData.system.factions.player);
        e.addBehavior(LInventoryBehavior);
        e.addBehavior(LItemUserBehavior);
        e.addBehavior(LEquipmentUserBehavior);
        e.addBehavior(LActorBehavior, actorId);    // この時点の装備品などで初期パラメータを作るので、後ろに追加しておく
        e.addBehavior(LEaterBehavior);
        e.addBehavior(LSurvivorBehavior);
        return e;
    }

    static newMonster(monsterId: number): LEntity {
        const e = REGame.world.spawnEntity();
        e.addBehavior(LCommonBehavior);
        e.addBehavior(LProjectableBehavior);
        e.addBehavior(LDecisionBehavior);
        e.addBehavior(LUnitBehavior).setFactionId(REData.system.factions.enemy);
        e.addBehavior(LEnemyBehavior, monsterId);
        //e.addBehavior(LEntityDivisionBehavior);
        return e;
    }

    static newItem(itemId: number): LEntity {
        const e = REGame.world.spawnEntity();
        e.addBehavior(LCommonBehavior);
        e.addBehavior(LProjectableBehavior);
        e.addBehavior(LItemBehavior, itemId);
        const item = REData.items[itemId];

        if (item.entity.kind == "Weapon" ||
            item.entity.kind == "Shield") {
            e.addBehavior(LEquipmentBehavior);
        }

        SBehaviorFactory.attachBehaviors(e, item.entity.behaviorNames);

        for (const name of item.entity.abilityNames) {
            const data = REData.abilities.find(x => x.key == name);
            if (!data) throw new Error(`Ability "${name}" not found.`);
            e.addAbility(data.id);
        }

        //e.addAbility(REData.abilities[1].id);  // TODO: Test
        this.setupDirectly_Item(e, item);
        return e;
    }

    /*
    static newEquipment(itemId: number): LEntity {
        const e = REGame.world.spawnEntity();
        e.addBehavior(LCommonBehavior);
        e.addBehavior(LProjectableBehavior);
        e.addBehavior(LItemBehavior, itemId);
        e.addBehavior(LEquipmentBehavior);
        return e;
    }
    */

    static newTrap(itemId: number): LEntity {
        const e = REGame.world.spawnEntity();
        e.addBehavior(LCommonBehavior);
        e.addBehavior(LProjectableBehavior);
        e.addBehavior(LItemBehavior, itemId);
        e.addBehavior(LTrapBehavior);
        return e;
    }

    static newExitPoint(): LEntity {
        const e = REGame.world.spawnEntity();
        e.addBehavior(LExitPointBehavior);
        e.addBehavior(LProjectableBehavior);
        return e;
    }

    static newEntryPoint(): LEntity {
        const e = REGame.world.spawnEntity();
        e.addBehavior(LEntryPointBehavior);
        e.addBehavior(LProjectableBehavior);
        return e;
    }

    static newMagicBullet(ownerItem: LEntity): LEntity {
        const e = REGame.world.spawnEntity();
        e.prefabKey = "pMagicBullet";
        //e.addBehavior(LCommonBehavior);

        e.addBehavior(LMagicBulletBehavior, ownerItem);
        return e;
    }

    static newOrnament(prefab: DPrefab): LEntity {
        const e = REGame.world.spawnEntity();
        e.prefabKey = prefab.key;
        e.addBehavior(LProjectableBehavior);
        return e;
    }

    static newEntity(data: DEntity): LEntity {
        const prefab = REData.prefabs[data.prefabId];
        let entity: LEntity;

        if (prefab.isEnemyKind()) {
            const data = REData.monsters[prefab.dataId];
            if (data)
                entity = SEntityFactory.newMonster(data.id);
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
            entity = this.newExitPoint();
        }
        else if (prefab.isExitPoint()) {
            entity = this.newEntryPoint();
        }
        else if (prefab.dataSource = DPrefabDataSource.Ornament) {
            entity = this.newOrnament(prefab);
        }
        else {
            throw new Error("Not implemented.");
        }

        // ステート追加
        for (const stateId of data.stateIds) {
            entity.addState(stateId);
        }

        entity.prefabKey = prefab.key;
        return entity;
    }

    static newEntityFromPrefabName(prefabName: string): LEntity {
        const id = REData.prefabs.findIndex(x => x.key == prefabName);
        if (id < 0) throw new Error(`Prefab "${prefabName}" not found.`);
        return this.newEntity({ prefabId: id, stateIds: [] });
    }

    // NOTE: エディタ側である程度カスタマイズできるように Note の設計を進めていたのだが、
    // どのぐらいの粒度で Behabior を分けるべきなのか現時点では決められなかった。(Activity単位がいいのか、Ability単位か、機能単位か)
    // そのためここで直定義して一通り作ってみた後、再検討する。
    static setupDirectly_Item(entity: LEntity, data: DItem) {
        switch (data.entity.key) {
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
}


