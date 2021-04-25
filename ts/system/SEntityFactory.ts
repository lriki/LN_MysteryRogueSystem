import { LEntity } from "../objects/LEntity";
import { LUnitAttribute } from "../objects/attributes/LUnitAttribute";
import { REData } from "../data/REData";
import { REGame } from "../objects/REGame";
import { REGame_DecisionBehavior } from "../objects/behaviors/REDecisionBehavior";
import { REUnitBehavior } from "../objects/behaviors/REUnitBehavior";
import { REExitPointBehavior } from "ts/objects/behaviors/REExitPointBehavior";
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
import { LEatableBehavior } from "ts/objects/behaviors/items/LEatableBehavior";
import { LItemBehavior_Grass1 } from "ts/objects/behaviors/items/LItemBehavior_Grass1";
//import { SBehaviorFactory } from "./internal";

export class SEntityFactory {
    static newActor(actorId: number): LEntity {
        const e = REGame.world.spawnEntity();
        e.addAttribute(new LUnitAttribute());
        e.addBehavior(LCommonBehavior);
        e.addBehavior(REGame_DecisionBehavior);
        e.addBehavior(REUnitBehavior).setFactionId(REData.ActorDefaultFactionId);
        e.addBehavior(LInventoryBehavior);
        e.addBehavior(LItemUserBehavior);
        e.addBehavior(LEquipmentUserBehavior);
        e.addBehavior(LActorBehavior, actorId);    // この時点の装備品などで初期パラメータを作るので、後ろに追加しておく
        e.addBehavior(LEaterBehavior);
        return e;
    }

    static newMonster(monsterId: number): LEntity {
        const e = REGame.world.spawnEntity();
        e.addAttribute(new LUnitAttribute());
        e.addBehavior(LCommonBehavior);
        e.addBehavior(REGame_DecisionBehavior);
        e.addBehavior(REUnitBehavior).setFactionId(REData.EnemeyDefaultFactionId);
        e.addBehavior(LEnemyBehavior, monsterId);
        return e;
    }

    static newItem(itemId: number): LEntity {
        const e = REGame.world.spawnEntity();
        e.addBehavior(LCommonBehavior);
        e.addBehavior(LItemBehavior, itemId);
        const item = REData.items[itemId];
        SBehaviorFactory.attachBehaviors(e, item.entity.behaviors);
        //e.addAbility(REData.abilities[1].id);  // TODO: Test
        this.setupDirectly_Item(e, item);
        return e;
    }

    static newEquipment(itemId: number): LEntity {
        const e = REGame.world.spawnEntity();
        e.addBehavior(LCommonBehavior);
        e.addBehavior(LItemBehavior, itemId);
        e.addBehavior(LEquipmentBehavior);
        return e;
    }

    static newTrap(itemId: number): LEntity {
        const e = REGame.world.spawnEntity();
        e.addBehavior(LCommonBehavior);
        e.addBehavior(LItemBehavior, itemId);
        e.addBehavior(LTrapBehavior);
        return e;
    }

    static newExitPoint(): LEntity {
        const e = REGame.world.spawnEntity();
        e.addBehavior(REExitPointBehavior);
        return e;
    }

    static newEntryPoint(): LEntity {
        const e = REGame.world.spawnEntity();
        e.addBehavior(LEntryPointBehavior);
        return e;
    }

    static newMagicBullet(ownerItem: LEntity): LEntity {
        const e = REGame.world.spawnEntity();
        e.prefabKey = "pMagicBullet";
        //e.addBehavior(LCommonBehavior);

        e.addBehavior(LMagicBulletBehavior, ownerItem);
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
        else {
            throw new Error("Not implemented.");
        }

        entity.prefabKey = prefab.key;
        return entity;
    }

    // NOTE: エディタ側である程度カスタマイズできるように Note の設計を進めていたのだが、
    // どのぐらいの粒度で Behabior を分けるべきなのか現時点では決められなかった。(Activity単位がいいのか、Ability単位か、機能単位か)
    // そのためここで直定義して一通り作ってみた後、再検討する。
    static setupDirectly_Item(entity: LEntity, data: DItem) {
        switch (data.entity.key) {
            case "kキュアリーフ":
                entity.addBehavior(LItemBehavior_Grass1);
                break;
        }
    }
}


