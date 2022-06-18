import { REGame } from "ts/mr/objects/REGame";
import { TestEnv } from "./../TestEnv";
import "./../Extension";
import { RESystem } from "ts/mr/system/RESystem";
import { LTileShape } from "ts/mr/objects/LBlock";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { SEntityFactory } from "ts/mr/system/internal";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { MRData } from "ts/mr/data/MRData";
import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("map.WaterBlock.EdgeMoving", () => {
    TestEnv.newGame();

    const player1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world.transferEntity(player1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 12, 10);

    // Player と Enemy の間に水地を作る
    REGame.map.block(11, 10)._tileShape = LTileShape.Water;

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [Wait]
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
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

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ウッドアロー_A").id, [], "item1").withStackCount(1));
    inventory.addEntity(item1);
    
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 13, 10);
    const initialHP = enemy1.actualParam(MRBasics.params.hp);

    // Player と Enemy の間に水地を作る
    REGame.map.block(12, 10)._tileShape = LTileShape.Water;

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [撃つ]
    RESystem.dialogContext.postActivity(LActivity.makeShooting(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const hp = enemy1.actualParam(MRBasics.params.hp);
    expect(hp < initialHP).toBeTruthy();      // ダメージを受けているはず
});

// 投げたモノは WaterBlock を超えて飛んでいく？
test("map.WaterBlock.WoodArrow.ProjectileOverMove", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    player1.addState(MRData.getState("kState_UnitTest_投擲必中").id);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ウッドアロー_A").id, [], "item1").withStackCount(1));
    inventory.addEntity(item1);
    
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 13, 10);
    const initialHP = enemy1.actualParam(MRBasics.params.hp);

    // Player と Enemy の間に水地を作る
    REGame.map.block(12, 10)._tileShape = LTileShape.Water;

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [撃つ]
    RESystem.dialogContext.postActivity(LActivity.makeShooting(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const hp = enemy1.actualParam(MRBasics.params.hp);
    expect(hp < initialHP).toBeTruthy();      // ダメージを受けているはず
});

// 投げたモノが壁等に当たって水に落下すると沈む (消滅ではない)
test("map.WaterBlock.WoodArrow.SinkProjectile", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    player1.addState(MRData.getState("kState_UnitTest_投擲必中").id);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ウッドアロー_A").id, [], "item1").withStackCount(1));
    inventory.addEntity(item1);

    // Player の前に水と壁を作る
    REGame.map.block(12, 10)._tileShape = LTileShape.Water;
    REGame.map.block(13, 10)._tileShape = LTileShape.Wall;

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [撃つ]
    RESystem.dialogContext.postActivity(LActivity.makeShooting(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 水に落ちている
    expect(item1.mx).toBe(12);
    expect(item1.my).toBe(10);
});
