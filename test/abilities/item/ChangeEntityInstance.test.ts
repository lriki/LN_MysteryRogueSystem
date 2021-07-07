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
import { REData } from "ts/data/REData";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { LEnemyBehavior } from "ts/objects/behaviors/LEnemyBehavior";
import { LItemBehavior } from "ts/objects/behaviors/LItemBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Items.ChangeEntityInstance.Wave", () => {
    TestEnv.newGame();

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.dir = 6;
    TestEnv.performFloorTransfer();
    const inventory = actor1.getBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_チェンジの杖").id));
    item1._name = "item1";
    inventory.addEntity(item1);
    
    // enemy1
    const enemy1 = SEntityFactory.newMonster(REData.getEnemy("kEnemy_ウルフ").entity());
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 13, 10);
    const entityDataId = enemy1.dataId();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // item1 は [振る] ことができる
    expect(item1.queryReactions().includes(DBasics.actions.WaveActionId)).toBe(true);
    
    // [振る]
    const activity1 = SActivityFactory.newActivity(DBasics.actions.WaveActionId);
    activity1._setup(actor1, item1);
    RESystem.dialogContext.postActivity(activity1);
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.dataId()).not.toBe(entityDataId); // 種類が変わっていること
    expect(enemy1.x).toBe(12);                  // 変化したターンもモンスターに行動が回り、近づいてくる
});


test("Items.ChangeEntityInstance.Throw", () => {
    TestEnv.newGame();

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.dir = 6;
    TestEnv.performFloorTransfer();
    const inventory = actor1.getBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_チェンジの杖").id));
    item1._name = "item1";
    inventory.addEntity(item1);
    
    // enemy1
    const enemy1 = SEntityFactory.newMonster(REData.getEnemy("kEnemy_ウルフ").entity());
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 13, 10);
    const entityDataId = enemy1.dataId();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // [投げる]
    const activity = SActivityFactory.newActivity(DBasics.actions.ThrowActionId);
    activity._setup(actor1, item1);
    RESystem.dialogContext.postActivity(activity);
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.dataId()).not.toBe(entityDataId); // 種類が変わっていること
    expect(enemy1.x).toBe(12);                  // 変化したターンもモンスターに行動が回り、近づいてくる
});
