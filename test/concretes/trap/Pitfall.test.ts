import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { DLandForwardDirection } from "ts/mr/data/DLand";
import { assert } from "ts/mr/Common";

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
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_落とし穴A").id, [], "trap1"));
    MRLively.world.transferEntity(undefined, trap1, floorId, 11, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右 (罠上) へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const floorId2 = player1.floorId;
    expect(floorId2.floorNumber()).toBe(floorId.floorNumber());
});

test("concretes.trap.Pitfall.Downhill", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;
    floorId.landData().forwardDirection = DLandForwardDirection.Downhill;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    player1.addState(MRData.getState("kState_UT罠必中").id);

    // trap 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_落とし穴A").id, [], "trap1"));
    MRLively.world.transferEntity(undefined, trap1, floorId, 11, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右 (罠上) へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
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
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_落とし穴A").id, [], "trap1"));
    MRLively.world.transferEntity(undefined, trap1, floorId, 11, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右 (罠上) へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const floorId2 = player1.floorId;
    expect(floorId2.floorNumber()).toBe(floorId.floorNumber());  // フロア移動は発生しない
});
