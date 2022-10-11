import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.trap.RustTrap", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    player1.addState(MRData.getState("kState_UT罠必中").id);

    // アイテム 入手
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_青銅の盾_A").id, [], "shield1"));
    inventory.addEntity(shield1);

    // trap1 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_錆ワナ_A").id, [], "trap1"));
    MRLively.world.transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    const shield1_UP1 = shield1.actualParam(MRBasics.params.upgradeValue);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [装備]
    MRSystem.dialogContext.postActivity(LActivity.makeEquip(player1, shield1));
    // player を右 (罠上) へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRLively.world.random().resetSeed(5);     // 乱数調整
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 装備が錆びる
    const shield1_UP2 = shield1.actualParam(MRBasics.params.upgradeValue);
    expect(shield1_UP2 == shield1_UP1 - 1).toBe(true);
});
