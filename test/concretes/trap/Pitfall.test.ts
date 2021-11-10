import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { DLandForwardDirection } from "ts/re/data/DLand";
import { assert } from "ts/re/Common";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.trap.Pitfall.Uphill.OnFirstFloor", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;
    assert(floorId.floorNumber() == 1);
    floorId.landData().forwardDirection = DLandForwardDirection.Uphill;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);

    // trap 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_落とし穴").id, [], "trap1"));
    REGame.world._transferEntity(trap1, floorId, 11, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右 (罠上) へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const floorId2 = player1.floorId;
    expect(floorId2.floorNumber()).toBe(floorId.floorNumber());  // 次のフロアへ移動している
});

test("concretes.trap.Pitfall.Downhill", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;
    floorId.landData().forwardDirection = DLandForwardDirection.Downhill;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);

    // trap 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_落とし穴").id, [], "trap1"));
    REGame.world._transferEntity(trap1, floorId, 11, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右 (罠上) へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const floorId2 = player1.floorId;
    expect(floorId2.floorNumber()).toBe(floorId.floorNumber() + 1);  // 次のフロアへ移動している
});

test("concretes.trap.Pitfall.Flat", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;
    floorId.landData().forwardDirection = DLandForwardDirection.Flat;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);

    // trap 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_落とし穴").id, [], "trap1"));
    REGame.world._transferEntity(trap1, floorId, 11, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右 (罠上) へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const floorId2 = player1.floorId;
    expect(floorId2.floorNumber()).toBe(floorId.floorNumber());  // フロア移動は発生しない
});
