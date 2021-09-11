import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/data/REData";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { LActivity } from "ts/objects/activities/LActivity";
import { LFloorId } from "ts/objects/LFloorId";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("concretes.item.脱出の巻物", () => {
    TestEnv.newGame();

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();
    const inventory = actor1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_エスケープスクロール").id, [], "item1"));
    inventory.addEntity(item1);

    // item2
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_エスケープスクロール").id, [], "item1"));
    inventory.addEntity(item2);
    
    // enemy1
    const enemy1 = SEntityFactory.newMonster(REData.enemyEntity(1));
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10);
    const initialHP = enemy1.actualParam(DBasics.params.hp);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    {
        actor1.dir = 6;

        // [投げる]
        const activity = LActivity.makeThrow(actor1, item2).withConsumeAction();
        RESystem.dialogContext.postActivity(activity);
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
        expect(initialHP - enemy1.actualParam(DBasics.params.hp)).toBe(1);  // 1ダメージを受けているはず
        expect(item2.isDestroyed()).toBe(true); // item2 は消える
    }

    {
        // [読む]
        const activity = LActivity.makeRead(actor1, item1).withConsumeAction();
        RESystem.dialogContext.postActivity(activity);
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
        // ExitMap へ遷移しているはず
        const exitMapId = REGame.map.land2().landData().exitRMMZMapId;
        expect(actor1.floorId.floorNumber()).toBe(exitMapId);
    }
});

