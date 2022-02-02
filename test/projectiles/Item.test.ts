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
import { REBasics } from "ts/re/data/REBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Item.ThrowAndDrop", () => {
    TestEnv.newGame();

    // Player
    const player1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    player1.dir = 6;
    REGame.world._transferEntity(player1, TestEnv.FloorId_FlatMap50x50, 5, 5);
    TestEnv.performFloorTransfer();

    // アイテムを作ってインベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    RESystem.scheduler.stepSimulation();

    //----------------------------------------------------------------------------------------------------

    // [投げる]
    const activity1 = LActivity.makeThrow(player1, item1).withConsumeAction();
    RESystem.dialogContext.postActivity(activity1);
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();

    // [投げる]
    const activity2 = LActivity.makeThrow(player1, item2).withConsumeAction();
    RESystem.dialogContext.postActivity(activity2);
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();

    // item1 と item2 は違うところに落ちたはず
    expect(item1.x != item2.x || item1.y != item2.y).toBe(true);
});

test("Item.DropAndDestroy", () => {
    TestEnv.newGame();

    // Player
    const player1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    player1.dir = 6;
    REGame.world._transferEntity(player1, TestEnv.FloorId_FlatMap50x50, 5, 5);
    TestEnv.performFloorTransfer();

    // アイテムを作ってインベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

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
    const activity1 = LActivity.makeThrow(player1, item1).withConsumeAction();
    RESystem.dialogContext.postActivity(activity1);
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();
    
    // 置くところが無いので削除される
    expect(item1.isDestroyed()).toBe(true);
});


test("projectiles.Item.AwfulThrowing", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.addState(REData.getState("kState_UT下手投げ").id);

    // アイテムを作ってインベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_フレイムリーフ_A").id, [], "item1"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 12, 10);

    RESystem.scheduler.stepSimulation();

    //----------------------------------------------------------------------------------------------------

    // [投げる]
    const activity1 = LActivity.makeThrow(player1, item1).withEntityDirection(6).withConsumeAction();
    RESystem.dialogContext.postActivity(activity1);
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();

    // 下手投げ状態なので当たらず、落下している
    const block = REGame.map.block(12, 10);
    const item = block.layer(DBlockLayerKind.Ground).firstEntity();
    expect(item).toBe(item1);
    expect(item1.x).toBe(12);
    expect(item1.y).toBe(10);
    expect(item1.isDestroyed()).toBe(false);
});

test("Item.ReflectionObject", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);

    // object1
    const object1 = TestEnv.createReflectionObject(floorId, 13, 10);

    // アイテムを作ってインベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 適当に HP を減らしておく
    const player1HpMax1 = player1.idealParam(REBasics.params.hp);
    player1.setActualParam(REBasics.params.hp, Math.max(player1HpMax1 - 10, 1));
    //const player1Hp1 = player1.actualParam(REBasics.params.hp);
    
    // [投げる]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // HPが回復している
    const player1Hp2 = player1.actualParam(REBasics.params.hp);
    expect(player1Hp2).toBe(player1HpMax1);
});
