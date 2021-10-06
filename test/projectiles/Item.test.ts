import { assert } from "ts/re/Common";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "./../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { DBlockLayerKind } from "ts/re/data/DCommon";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Item.ThrowAndDrop", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1.dir = 6;
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);
    TestEnv.performFloorTransfer();

    // アイテムを作ってインベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    RESystem.scheduler.stepSimulation();

    //----------------------------------------------------------------------------------------------------

    // [投げる]
    const activity1 = LActivity.makeThrow(actor1, item1).withConsumeAction();
    RESystem.dialogContext.postActivity(activity1);
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();

    // [投げる]
    const activity2 = LActivity.makeThrow(actor1, item2).withConsumeAction();
    RESystem.dialogContext.postActivity(activity2);
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();

    // item1 と item2 は違うところに落ちたはず
    expect(item1.x != item2.x || item1.y != item2.y).toBe(true);
});

test("Item.DropAndDestroy", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1.dir = 6;
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);
    TestEnv.performFloorTransfer();

    // アイテムを作ってインベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    // 床にアイテムを敷き詰める
    const ox = 7//10;
    const oy = 2//5;
    for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
            const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
            REGame.world._transferEntity(item, TestEnv.FloorId_FlatMap50x50, ox + x, oy + y);
        }
    }

    RESystem.scheduler.stepSimulation();

    //----------------------------------------------------------------------------------------------------

    // [投げる]
    const activity1 = LActivity.makeThrow(actor1, item1).withConsumeAction();
    RESystem.dialogContext.postActivity(activity1);
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();
    
    // 置くところが無いので削除される
    expect(item1.isDestroyed()).toBe(true);
});


test("projectiles.Item.AwfulThrowing", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(REData.getStateFuzzy("kState_UT下手投げ").id);

    // アイテムを作ってインベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("k火炎草70_50").id, [], "item1"));
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 12, 10);

    RESystem.scheduler.stepSimulation();

    //----------------------------------------------------------------------------------------------------

    // [投げる]
    const activity1 = LActivity.makeThrow(actor1, item1).withEntityDirection(6).withConsumeAction();
    RESystem.dialogContext.postActivity(activity1);
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();

    // const item = REGame.map.block(12, 10).layer(DBlockLayerKind.Ground).firstEntity();
    // expect(item).toBe(item1);
    // expect(item1.x).toBe(12);
    // expect(item1.y).toBe(10);
    // expect(item1.isDestroyed()).toBe(false);
});

