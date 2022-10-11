import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { SMotionSequel } from "ts/mr/system/SSequel";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.trap.StumbleTrap", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    player1.addState(MRData.getState("kState_UT罠必中").id);

    // アイテム 入手
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [], "weapon1"));
    inventory.addEntity(weapon1);

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

    // モーション発行順チェック
    expect(TestEnv.sequelSets.length).toBe(2);
    const set1 = TestEnv.sequelSets[0];
    const sequels1 = set1.runs()[0].clips()[0].sequels();
    expect(sequels1.length).toBe(1);
    expect((sequels1[0] as SMotionSequel).sequelId()).toBe(MRBasics.sequels.MoveSequel);

    // モーション発行順チェック
    const set2 = TestEnv.sequelSets[1];
    const clips2 = set2.runs()[0].clips();
    expect(clips2.length).toBe(2);
    const sequels2_1 = clips2[0].sequels()[0];
    const sequels2_2 = clips2[1].sequels()[0];
    expect((sequels2_1 as SMotionSequel).sequelId()).toBe(MRBasics.sequels.jump);
    expect((sequels2_2 as SMotionSequel).sequelId()).toBe(MRBasics.sequels.stumble);

    // アイテムが目の前に落ちる
    const item1 = MRLively.map.block(12, 10).getFirstEntity();
    expect(item1).toBe(weapon1);
});
