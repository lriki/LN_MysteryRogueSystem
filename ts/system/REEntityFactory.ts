import { LEntity } from "../objects/LEntity";
import { LUnitAttribute } from "../objects/attributes/LUnitAttribute";
import { REData } from "../data/REData";
import { REGame } from "../objects/REGame";
import { REGame_DecisionBehavior } from "../objects/behaviors/REDecisionBehavior";
import { REUnitBehavior } from "../objects/behaviors/REUnitBehavior";
import { TileKind } from "../objects/REGame_Block";
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

export class REEntityFactory {
    static newActor(actorId: number): LEntity {
        const e = REGame.world.spawnEntity();
        e.addAttribute(new LUnitAttribute()
            .setFactionId(REData.ActorDefaultFactionId));
        e.addBasicBehavior(new LCommonBehavior());
        e.addBasicBehavior(new REGame_DecisionBehavior());
        e.addBasicBehavior(new REUnitBehavior());
        e.addBasicBehavior(new LInventoryBehavior());
        e.addBasicBehavior(new LItemUserBehavior());
        e.addBasicBehavior(new LEquipmentUserBehavior());
        e.addBasicBehavior(new LActorBehavior(actorId));    // この時点の装備品などで初期パラメータを作るので、後ろに追加しておく
        return e;
    }

    static newMonster(monsterId: number): LEntity {
        const e = REGame.world.spawnEntity();
        e.addAttribute(new LUnitAttribute()
            .setFactionId(REData.EnemeyDefaultFactionId));
        e.addBasicBehavior(new LCommonBehavior());
        e.addBasicBehavior(new REGame_DecisionBehavior());
        e.addBasicBehavior(new REUnitBehavior());
        //e.addBasicBehavior(new LBattlerBehavior());
        e.addBasicBehavior((new LEnemyBehavior()).init(monsterId));
        return e;
    }

    static newItem(itemId: number): LEntity {
        const e = REGame.world.spawnEntity();
        e.addBasicBehavior(new LCommonBehavior());
        e.addBasicBehavior(new LItemBehavior(itemId));
        e.addAbility(REData.abilities[1].id);  // TODO: Test
        return e;
    }

    static newEquipment(itemId: number): LEntity {
        const e = REGame.world.spawnEntity();
        e.addBasicBehavior(new LCommonBehavior());
        e.addBasicBehavior(new LItemBehavior(itemId));
        e.addBasicBehavior(new LEquipmentBehavior());
        return e;
    }

    static newTrap(itemId: number): LEntity {
        const e = REGame.world.spawnEntity();
        e.addBasicBehavior(new LCommonBehavior());
        e.addBasicBehavior(new LItemBehavior(itemId));
        e.addBasicBehavior(new LTrapBehavior());
        return e;
    }

    static newExitPoint(): LEntity {
        const e = REGame.world.spawnEntity();
        e.addBasicBehavior(new REExitPointBehavior());
        return e;
    }

    static newMagicBullet(ownerItem: LEntity): LEntity {
        const e = REGame.world.spawnEntity();
        e.prefabKey = "pMagicBullet";
        //e.addBasicBehavior(new LCommonBehavior());

        const b = new LMagicBulletBehavior();
        b.setup(ownerItem);
        e.addBasicBehavior(b);
        return e;
    }
}

