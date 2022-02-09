import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { REBasics } from "ts/re/data/REBasics";
import { LTrapBehavior } from "ts/re/objects/behaviors/LTrapBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.trap.Landmine.basic", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const hp1 = 8;
    player1.setActualParam(REBasics.params.hp, hp1);    // テストしやすいように、割り切れる HP にしておく

    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 13, 10);

    // item
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_キュアリーフ_A").id, [], "item1"));
    REGame.world._transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 11, 9);

    // trap 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_地雷_A").id, [], "trap1"));
    REGame.world._transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右 (罠上) へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    REGame.world.random().resetSeed(5);     // 乱数調整
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const hp2 = player1.actualParam(REBasics.params.hp);
    expect(hp2).toBe(hp1 / 2);  // HP半分になっている
    expect(player1.isDestroyed()).toBe(false);  // 消滅していないこと
    expect(trap1.isDestroyed()).toBe(false);    // 消滅していないこと
    expect(enemy1.isDestroyed()).toBe(true);    // 寄ってきたモンスターは爆発に巻き込まれて即死
    expect(item1.isDestroyed()).toBe(true);     // アイテムは消滅
});

test("concretes.trap.Landmine.InducedExplosion", () => {
    TestEnv.newGame();

    /*
        Ｐ罠
        罠敵
    */

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const hp1 = 16;
    player1.setActualParam(REBasics.params.hp, hp1);    // テストしやすいように、割り切れる HP にしておく

    // trap 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_地雷_A").id, [], "trap1"));
    const trap2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_地雷_A").id, [], "trap2"));
    REGame.world._transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    REGame.world._transferEntity(trap2, TestEnv.FloorId_FlatMap50x50, 10, 11);

    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 11);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右 (罠上) へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    REGame.world.random().resetSeed(5);     // 乱数調整
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const hp2 = player1.actualParam(REBasics.params.hp);
    expect(hp2).toBe(hp1 / 4);  // HP半分を２回受けている
    expect(player1.isDestroyed()).toBe(false);  // 消滅していないこと
    expect(trap1.isDestroyed()).toBe(false);    // 消滅していないこと
    expect(trap2.isDestroyed()).toBe(false);    // 消滅していないこと
    expect(trap2.getEntityBehavior(LTrapBehavior).exposed()).toBe(true);    // 露出していること
    expect(enemy1.isDestroyed()).toBe(true);    // 寄ってきたモンスターは爆発に巻き込まれて即死
    expect(REGame.messageHistory.includesText("ダメージを受けた"));    // プレイヤーに対する2回のみダメージ表示がある。
    expect(REGame.messageHistory.includesText("倒れた"));   // モンスターに対して複数回 "倒れた" が表示されないこと。
});

