import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { LActionTokenType } from "ts/re/objects/LActionToken";
import { assert } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.AntiPoisonGrass.player", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const pow1 = player1.actualParam(REBasics.params.pow);

    const object1 = TestEnv.createReflectionObject(floorId, 13, 10);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_アンチポイズン_A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_アンチポイズン_A").id, [], "item2"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    TestUtils.testCommonGrassBegin(player1, item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    player1.setActualParam(REBasics.params.pow, 1);
    expect(player1.actualParam(REBasics.params.pow)).toBe(1);       // 一応チェック

    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const pow2 = player1.actualParam(REBasics.params.pow);
    expect(pow2).toBe(pow1);    // ちからが最大まで回復
    expect(REGame.messageHistory.includesText("回復した")).toBeTruthy();

    TestUtils.testCommonGrassEnd(player1, item1);

    //----------------------------------------------------------------------------------------------------
    
    player1.setActualParam(REBasics.params.pow, 1);
    expect(player1.actualParam(REBasics.params.pow)).toBe(1);       // 一応チェック
    const hp1 = player1.actualParam(REBasics.params.hp);

    // [投げる] > 反射
    RESystem.dialogContext.postActivity(LActivity.makeThrow(player1, item2).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const pow3 = player1.actualParam(REBasics.params.pow);
    const hp2 = player1.actualParam(REBasics.params.hp);
    expect(pow3).toBe(pow1);        // ちからが最大まで回復
    expect(hp2).toBe(hp1);  // ダメージをうけたりしていない
    
});

test("concretes.item.grass.AntiPoisonGrass.enemy", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const hp1 = player1.actualParam(REBasics.params.hp);
    const pow1 = player1.actualParam(REBasics.params.pow);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_ゾンビA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_UnitTestFlatMap50x50, 15, 10);
    const enemy1Hp1 = enemy1.actualParam(REBasics.params.hp);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_アンチポイズン_A").id, [], "item1"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);


    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    
    // [投げる]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(player1, item1).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const enemy1Hp2 = enemy1.actualParam(REBasics.params.hp);
    expect(enemy1Hp2).toBeLessThan(enemy1Hp1);  // ドレイン系はダメージをうける
});
