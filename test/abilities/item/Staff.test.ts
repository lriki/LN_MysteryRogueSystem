import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { SActivityFactory } from "ts/system/SActivityFactory";
import { DialogSubmitMode } from "ts/system/SDialog";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Items.Staff.Knockback", () => {
    SGameManager.createGameObjects();
    const dc = RESystem.dialogContext;

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.dir = 6;
    TestEnv.performFloorTransfer();
    const inventory = actor1.getBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntityFromPrefabName("pふきとばしの杖");
    item1._name = "item1";
    inventory.addEntity(item1);
    
    // enemy1
    const enemy1 = SEntityFactory.newMonster(1);
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // [振る]
    const activity1 = SActivityFactory.newActivity(DBasics.actions.WaveActionId);
    activity1._setup(actor1, item1);
    dc.postActivity(activity1);
    dc.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 吹き飛ばし効果で 10Block 後退 & Enemy ターンで Player に 1Block 近づく
    expect(enemy1.x).toBe(20);
});
