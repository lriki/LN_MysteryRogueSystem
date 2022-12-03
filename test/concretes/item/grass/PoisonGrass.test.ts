import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.PoisonGrass", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    const state1 = MRData.getState("kState_UTまどわし").id;
    const state2 = MRData.getState("kState_UT混乱").id;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    player1.addState(state1);
    player1.addState(state2);
    player1.addState(MRData.getState("kState_UnitTest_投擲必中").id);
    const hp1 = player1.getActualParam(MRBasics.params.hp);
    const pow1 = player1.getActualParam(MRBasics.params.pow);
    const player1Atk1 = player1.getActualParam(MRBasics.params.atk);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 15, 10);
    const enemy1Hp1 = enemy1.getActualParam(MRBasics.params.hp);
    const enemy1Pow1 = enemy1.getActualParam(MRBasics.params.pow);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_毒草B").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_毒草B").id, [], "item2"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    TestUtils.testCommonGrassBegin(player1, item1);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [食べる]
    MRSystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const hp2 = player1.getActualParam(MRBasics.params.hp);
    const pow2 = player1.getActualParam(MRBasics.params.pow);
    const player1Atk2 = player1.getActualParam(MRBasics.params.atk);
    expect(hp2).toBeLessThan(hp1);          // ダメージをうける
    expect(pow2).toBeLessThan(pow1);        // ちからが減る
    expect(player1.isStateAffected(state1)).toBeFalsy();
    expect(player1.isStateAffected(state2)).toBeFalsy();
    expect(player1Atk2).toBe(player1Atk1);  // 攻撃力が下がったりしていない

    //----------------------------------------------------------------------------------------------------
    
    // [投げる]
    MRSystem.dialogContext.postActivity(LActivity.makeThrow(player1, item2).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const enemy1Hp2 = enemy1.getActualParam(MRBasics.params.hp);
    const enemy1Atk2 = enemy1.getActualParam(MRBasics.params.atk);
    const enemy1Pow2 = enemy1.getActualParam(MRBasics.params.pow);
    expect(enemy1Hp2).toBeLessThan(enemy1Hp1);  // ダメージをうける
    expect(enemy1Atk2).toBe(0);                 // 攻撃力 0
    expect(enemy1Pow2).toBe(enemy1Pow1);        // ちからは減らない
    
    TestUtils.testCommonGrassEnd(player1, item1);
});

