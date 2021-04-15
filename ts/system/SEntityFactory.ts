import { LEntity } from "../objects/LEntity";
import { LUnitAttribute } from "../objects/attributes/LUnitAttribute";
import { REData } from "../data/REData";
import { REGame } from "../objects/REGame";
import { REGame_DecisionBehavior } from "../objects/behaviors/REDecisionBehavior";
import { REUnitBehavior } from "../objects/behaviors/REUnitBehavior";
import { TileKind } from "../objects/LBlock";
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
import { LMagicBulletBehavior } from "ts/objects/behaviors/LMagicBulletBehavior";
import { DEntity } from "ts/data/DEntity";
import { DPrefabKind } from "ts/data/DPrefab";
import { LEntryPointBehavior } from "ts/objects/behaviors/LEntryPointBehavior";

export class SEntityFactory {
    static newActor(actorId: number): LEntity {
        const e = REGame.world.spawnEntity();
        e.addAttribute(new LUnitAttribute()
            .setFactionId(REData.ActorDefaultFactionId));
        e.addBehavior(LCommonBehavior);
        e.addBehavior(REGame_DecisionBehavior);
        e.addBehavior(REUnitBehavior);
        e.addBehavior(LInventoryBehavior);
        e.addBehavior(LItemUserBehavior);
        e.addBehavior(LEquipmentUserBehavior);
        e.addBehavior(LActorBehavior, actorId);    // この時点の装備品などで初期パラメータを作るので、後ろに追加しておく
        return e;
    }

    static newMonster(monsterId: number): LEntity {
        const e = REGame.world.spawnEntity();
        e.addAttribute(new LUnitAttribute()
            .setFactionId(REData.EnemeyDefaultFactionId));
        e.addBehavior(LCommonBehavior);
        e.addBehavior(REGame_DecisionBehavior);
        e.addBehavior(REUnitBehavior);
        e.addBehavior(LEnemyBehavior, monsterId);
        return e;
    }

    static newItem(itemId: number): LEntity {
        const e = REGame.world.spawnEntity();
        e.addBehavior(LCommonBehavior);
        e.addBehavior(LItemBehavior, itemId);
        e.addAbility(REData.abilities[1].id);  // TODO: Test
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
        switch (prefab.kind) {
            case DPrefabKind.Enemy: {
                const data = REData.monsters.find(x => x.key == prefab.rmmzDataKey);
                if (data)
                    entity = SEntityFactory.newMonster(data.id);
                else
                    throw new Error("Invalid enemy key: " + prefab.key);
                }
                break;

            case DPrefabKind.Trap: {
                throw new Error("Not implemented.");
                break;
            }

            case DPrefabKind.Item: {
                throw new Error("Not implemented.");
                break;
            }
            case DPrefabKind.System: {
                if (prefab.rmmzDataKey == "RE-SystemPrefab:ExitPoint") {
                    entity = this.newExitPoint();
                }
                else if (prefab.rmmzDataKey == "RE-SystemPrefab:EntryPoint") {
                    entity = this.newEntryPoint();
                }
                else {
                    throw new Error("Not implemented.");
                }
                break;
            }
            default:
                throw new Error("Not implemented.");
        }

        entity.prefabKey = prefab.key;
        return entity;
    }
}


