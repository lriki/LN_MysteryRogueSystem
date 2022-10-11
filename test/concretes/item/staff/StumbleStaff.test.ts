import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.staff.StumbleStaff.basic", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.dir = 6;
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    
    // アイテム 入手
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_転ばぬ先の杖_A").id, [], "item1"));
    inventory.addEntity(item1);

    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 13, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [振る]
    MRSystem.dialogContext.postActivity(LActivity.makeWave(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 何か足元に落ちてる
    const item2 = MRLively.map.block(13, 10).getFirstEntity();
    expect(item2 !== undefined).toBe(true);
});


test("concretes.activity.Stumble.prevention", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.addState(MRData.getState("kState_UT罠必中").id);
    player1.dir = 6;
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const hp1 = player1.actualParam(MRBasics.params.hp);
    
    // アイテム 入手
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_転ばぬ先の杖_A").id, [], "item1"));
    inventory.addEntity(item1);
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [], "weapon1"));
    inventory.addEntity(weapon1);
    const rem1 = item1.actualParam(MRBasics.params.remaining);

    // trap1 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_転び石_A").id, [], "trap1"));
    MRLively.world.transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    
    // player を右 (罠上) へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRLively.world.random().resetSeed(5);     // 乱数調整
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 転倒は予防され、アイテムは落下していないこと。また杖の使用回数が減っていること。
    const hp2 = player1.actualParam(MRBasics.params.hp);
    const rem2 = item1.actualParam(MRBasics.params.remaining);
    expect(hp2).toBe(hp1);
    expect(inventory.contains(item1)).toBe(true);
    expect(rem2).toBe(rem1 - 1);
});
