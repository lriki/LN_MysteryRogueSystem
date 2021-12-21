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

test("concretes.item.grass.PoisonGrass", () => {
    TestEnv.newGame();
    const state1 = REData.getState("kState_UTまどわし").id;
    const state2 = REData.getState("kState_UT混乱").id;

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    player1.addState(state1);
    player1.addState(state2);
    const hp1 = player1.actualParam(REBasics.params.hp);
    const pow1 = player1.actualParam(REBasics.params.pow);
    const player1Atk1 = player1.actualParam(REBasics.params.atk);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_UnitTestFlatMap50x50, 15, 10);
    const enemy1Hp1 = enemy1.actualParam(REBasics.params.hp);
    const enemy1Pow1 = enemy1.actualParam(REBasics.params.pow);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kポイズンドラッグ").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kポイズンドラッグ").id, [], "item2"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    TestUtils.testCommonGrassBegin(player1, item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    const hp2 = player1.actualParam(REBasics.params.hp);
    const pow2 = player1.actualParam(REBasics.params.pow);
    const player1Atk2 = player1.actualParam(REBasics.params.atk);
    expect(hp2).toBeLessThan(hp1);          // ダメージをうける
    expect(pow2).toBeLessThan(pow1);        // ちからが減る
    expect(player1.isStateAffected(state1)).toBeFalsy();
    expect(player1.isStateAffected(state2)).toBeFalsy();
    expect(player1Atk2).toBe(player1Atk1);  // 攻撃力が下がったりしていない

    // [投げる]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(player1, item2).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    const enemy1Hp2 = enemy1.actualParam(REBasics.params.hp);
    const enemy1Atk2 = enemy1.actualParam(REBasics.params.atk);
    const enemy1Pow2 = enemy1.actualParam(REBasics.params.pow);
    expect(enemy1Hp2).toBeLessThan(enemy1Hp1);  // ダメージをうける
    expect(enemy1Atk2).toBe(0);                 // 攻撃力 0
    expect(enemy1Pow2).toBe(enemy1Pow1);        // ちからは減らない
    
    TestUtils.testCommonGrassEnd(player1, item1);
});

