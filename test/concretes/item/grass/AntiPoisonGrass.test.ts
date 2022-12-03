import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { LActionTokenType } from "ts/mr/lively/LActionToken";
import { assert } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.AntiPoisonGrass.player", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const pow1 = player1.getActualParam(MRBasics.params.pow);

    const object1 = TestEnv.createReflectionObject(floorId, 13, 10);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_毒消し草A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_毒消し草A").id, [], "item2"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    TestUtils.testCommonGrassBegin(player1, item1);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    player1.setParamCurrentValue(MRBasics.params.pow, 1);
    expect(player1.getActualParam(MRBasics.params.pow)).toBe(1);       // 一応チェック

    // [食べる]
    MRSystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const pow2 = player1.getActualParam(MRBasics.params.pow);
    expect(pow2).toBe(pow1);    // ちからが最大まで回復
    expect(MRLively.messageHistory.includesText("ちからが回復した")).toBeTruthy();  // "ちからが7回復した" とはならない

    TestUtils.testCommonGrassEnd(player1, item1);

    //----------------------------------------------------------------------------------------------------
    
    player1.setParamCurrentValue(MRBasics.params.pow, 1);
    expect(player1.getActualParam(MRBasics.params.pow)).toBe(1);       // 一応チェック
    const hp1 = player1.getActualParam(MRBasics.params.hp);

    // [投げる] > 反射
    MRSystem.dialogContext.postActivity(LActivity.makeThrow(player1, item2).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const pow3 = player1.getActualParam(MRBasics.params.pow);
    const hp2 = player1.getActualParam(MRBasics.params.hp);
    expect(pow3).toBe(pow1);        // ちからが最大まで回復
    expect(hp2).toBe(hp1);  // ダメージをうけたりしていない
    
});

test("concretes.item.grass.AntiPoisonGrass.enemy", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const hp1 = player1.getActualParam(MRBasics.params.hp);
    const pow1 = player1.getActualParam(MRBasics.params.pow);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_ゾンビA").id, [], "enemy1"));
    MRLively.world.transferEntity(undefined, enemy1, TestEnv.FloorId_UnitTestFlatMap50x50, 15, 10);
    const enemy1Hp1 = enemy1.getActualParam(MRBasics.params.hp);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_毒消し草A").id, [], "item1"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);


    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    
    // [投げる]
    MRSystem.dialogContext.postActivity(LActivity.makeThrow(player1, item1).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const enemy1Hp2 = enemy1.getActualParam(MRBasics.params.hp);
    expect(enemy1Hp2).toBeLessThan(enemy1Hp1);  // ドレイン系はダメージをうける
});
