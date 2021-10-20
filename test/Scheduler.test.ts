import { REBasics } from "ts/re/data/REBasics";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "./TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LUnitBehavior } from "ts/re/objects/behaviors/LUnitBehavior";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

// Player が速くなる場合
test("Scheduler.ChangeSpeed1", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 10, 11);
    enemy1.addState(REBasics.states.debug_MoveRight);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 倍速化して [待機]
    actor1.getEntityBehavior(LUnitBehavior).setSpeedLevel(2);
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.x).toBe(10);  // まだ enemy にターンは回らないので移動していない

    // [待機]
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.x).toBe(11);  // enemy にターンは回って移動してる
});

// Enemy が速くなる場合 -> Player の後に Enemy が2回行動
test("Scheduler.ChangeSpeed2", () => {
    TestEnv.newGame();

    // Players
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kItem_スピードドラッグ").id, [], "item3"));
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 10, 11);
    enemy1.addState(REBasics.states.debug_MoveRight);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 倍速化して [待機]
    //enemy1.getBehavior(LUnitBehavior).setSpeedLevel(2);
    //RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    //RESystem.dialogContext.activeDialog().submit();
    
    // [投げる]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(actor1, item1).withEntityDirection(2).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.x).toBe(12);

    // [待機]
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.x).toBe(14);
});

// 倍速 Enemy がいるときに Player が倍速になる
//   -> Player がすばやさ草を飲んだ直後は Enemy が行動する
test("Scheduler.ChangeSpeed3", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 10, 11);
    enemy1.addState(REBasics.states.debug_MoveRight);
    enemy1.getEntityBehavior(LUnitBehavior).setSpeedLevel(2); // 倍速化

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 倍速化して [待機]
    actor1.getEntityBehavior(LUnitBehavior).setSpeedLevel(2);
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.x).toBe(11);  // Enemy に 1度だけ turn がまわる
});


test("Scheduler.ChangeSpeed4", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.getEntityBehavior(LUnitBehavior).setSpeedLevel(3);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 10, 11);
    enemy1.addState(REBasics.states.debug_MoveRight);
    enemy1.getEntityBehavior(LUnitBehavior).setSpeedLevel(2);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [待機]
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.x).toBe(11);  // Enemy に 1度だけ turn がまわる
});

test("Scheduler.ChangeSpeed5", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 10, 11);
    enemy1.addState(REBasics.states.debug_MoveRight);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // Enemy を鈍足化して [待機]
    enemy1.getEntityBehavior(LUnitBehavior).setSpeedLevel(-1);
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.x).toBe(10);  // 速度ダウンを検知したときに行動トークンが削られるので、Enemy に Turn はまわらない
});
