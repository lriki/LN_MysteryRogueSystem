import { MRBasics } from "ts/mr/data/MRBasics";
import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { MRLively } from "ts/mr/lively/MRLively";
import { LTileShape } from "ts/mr/lively/LBlock";

beforeAll(() => {
    TestEnv.setupDatabase();
});

// 木の矢
test("concretes.item.arrow.WoodArrow", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // player1 配置
    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    player1.addState(MRData.getState("kState_UnitTest_投擲必中").id);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_木の矢A").id, [], "item1"));
    inventory.addEntity(item1);
    expect(item1._stackCount).toBeGreaterThanOrEqual(2);    // 初期状態で幾つかスタックされている
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 13, 10);
    const initialHP = enemy1.getActualParam(MRBasics.params.hp);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    TestUtils.testCommonArrow(item1);
    
    // [撃つ]
    const activity1 = LActivity.makeShooting(player1, item1).withConsumeAction();
    MRSystem.dialogContext.postActivity(activity1);
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const hp = enemy1.getActualParam(MRBasics.params.hp);
    expect(hp < initialHP).toBeTruthy();      // ダメージを受けているはず
});

// 鉄の矢
test("concretes.item.arrow.IronArrow", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // player1 配置
    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    player1.addState(MRData.getState("kState_UnitTest_投擲必中").id);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_鉄の矢A").id, [], "item1"));
    inventory.addEntity(item1);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 13, 10);
    const initialHP = enemy1.getActualParam(MRBasics.params.hp);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    TestUtils.testCommonArrow(item1);
    
    // [撃つ]
    const activity1 = LActivity.makeShooting(player1, item1).withConsumeAction();
    MRSystem.dialogContext.postActivity(activity1);
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const hp = enemy1.getActualParam(MRBasics.params.hp);
    expect(hp < initialHP).toBeTruthy();      // ダメージを受けているはず
});

// 貫通矢
test("concretes.item.arrow.PenetrationArrow", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // player1 配置
    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    player1.addState(MRData.getState("kState_UnitTest_投擲必中").id);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_銀の矢A").id));
    item1._name = "item1";
    inventory.addEntity(item1);
    item1._stackCount = 1;  // 消滅のチェックをしたいので、スタック数1に調整する
    
    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy2"));
    TestEnv.transferEntity(enemy1, floorId, 15, 10);
    TestEnv.transferEntity(enemy2, floorId, 17, 10);
    const enemy1HP1 = enemy1.getActualParam(MRBasics.params.hp);
    const enemy2HP1 = enemy2.getActualParam(MRBasics.params.hp);

    // Player の右に壁を作る
    MRLively.mapView.currentMap.block(11, 10)._tileShape = LTileShape.Wall;

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [撃つ]
    const activity1 = LActivity.makeShooting(player1, item1).withEntityDirection(6).withConsumeAction();
    MRSystem.dialogContext.postActivity(activity1);
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 壁を貫通し、2体の Enemy にダメージが出ている
    const enemy1HP2 = enemy1.getActualParam(MRBasics.params.hp);
    const enemy2HP2 = enemy2.getActualParam(MRBasics.params.hp);
    expect(enemy1HP2).toBeLessThan(enemy1HP1);
    expect(enemy2HP2).toBeLessThan(enemy2HP1);

    // 矢は消滅
    expect(item1.isDestroyed()).toBeTruthy();
});

