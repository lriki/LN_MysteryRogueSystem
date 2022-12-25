import { MRLively } from "ts/mr/lively/MRLively";
import { TestEnv } from "./../TestEnv";
import "./../Extension";
import { MRSystem } from "ts/mr/system/MRSystem";
import { LTileShape } from "ts/mr/lively/LBlock";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { SEntityFactory } from "ts/mr/system/internal";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { MRData } from "ts/mr/data/MRData";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("map.WaterBlock.EdgeMoving", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);

    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 12, 10);

    // Player と Enemy の間に水地を作る
    MRLively.mapView.currentMap.block(11, 10)._tileShape = LTileShape.Water;

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [Wait]
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    expect(enemy1.mx).toBe(11);
    expect(enemy1.my).toBe(11);
});

// 投げたモノは WaterBlock を超えて飛んでいく？
test("map.WaterBlock.WoodArrow.ProjectileOverMove", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    player1.addState(MRData.getState("kState_UnitTest_投擲必中").id);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_木の矢A").id, [], "item1").withStackCount(1));
    inventory.addEntity(item1);
    
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 13, 10);
    const initialHP = enemy1.getActualParam(MRBasics.params.hp);

    // Player と Enemy の間に水地を作る
    MRLively.mapView.currentMap.block(12, 10)._tileShape = LTileShape.Water;

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [撃つ]
    MRSystem.dialogContext.postActivity(LActivity.makeShooting(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const hp = enemy1.getActualParam(MRBasics.params.hp);
    expect(hp < initialHP).toBeTruthy();      // ダメージを受けているはず
});

// 投げたモノは WaterBlock を超えて飛んでいく？
test("map.WaterBlock.WoodArrow.ProjectileOverMove", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    player1.addState(MRData.getState("kState_UnitTest_投擲必中").id);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_木の矢A").id, [], "item1").withStackCount(1));
    inventory.addEntity(item1);
    
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 13, 10);
    const initialHP = enemy1.getActualParam(MRBasics.params.hp);

    // Player と Enemy の間に水地を作る
    MRLively.mapView.currentMap.block(12, 10)._tileShape = LTileShape.Water;

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [撃つ]
    MRSystem.dialogContext.postActivity(LActivity.makeShooting(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const hp = enemy1.getActualParam(MRBasics.params.hp);
    expect(hp < initialHP).toBeTruthy();      // ダメージを受けているはず
});

// 投げたモノが壁等に当たって水に落下すると沈む (消滅ではない)
test("map.WaterBlock.WoodArrow.SinkProjectile", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    player1.addState(MRData.getState("kState_UnitTest_投擲必中").id);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_木の矢A").id, [], "item1").withStackCount(1));
    inventory.addEntity(item1);

    // Player の前に水と壁を作る
    MRLively.mapView.currentMap.block(12, 10)._tileShape = LTileShape.Water;
    MRLively.mapView.currentMap.block(13, 10)._tileShape = LTileShape.Wall;

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [撃つ]
    MRSystem.dialogContext.postActivity(LActivity.makeShooting(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 水に落ちている
    expect(item1.mx).toBe(12);
    expect(item1.my).toBe(10);
});
