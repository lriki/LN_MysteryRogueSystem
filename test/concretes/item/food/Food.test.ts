import { TestUtils } from "test/TestUtils";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { MRBasics } from "ts/re/data/MRBasics";
import { REData } from "ts/re/data/REData";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { RESystem } from "ts/re/system/RESystem";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { TestEnv } from "../../../TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.food.LittleFood", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_クロワッサン_A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_クロワッサン_A").id, [], "item2"));
    inventory1.addEntity(item1);
    inventory1.addEntity(item2);
    
    // おなかを減らしておく
    player1.setActualParam(MRBasics.params.fp, 2000);    // 20%

    TestUtils.testCommonFood(item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [食べる]
    TestUtils.submitActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 食べられたので消滅済み
    expect(item1.isDestroyed()).toBeTruthy();

    // FP が回復しているはず。
    expect(player1.actualParam(MRBasics.params.fp)).toBe(6990);

    const message = REGame.messageHistory;
    expect(message.countIncludesText("おなかがふくれた。")).toBe(1);

    //----------------------------------------------------------------------------------------------------

    // 満腹にする
    const maxFp1 = player1.idealParam(MRBasics.params.fp);
    player1.setActualParam(MRBasics.params.fp, maxFp1);

    // [食べる]
    TestUtils.submitActivity(LActivity.makeEat(player1, item2).withConsumeAction());
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 最大値も含め、FPが増えている
    const maxFp2 = player1.idealParam(MRBasics.params.fp);
    const fp2 = player1.actualParam(MRBasics.params.fp);
    expect(maxFp2).toBeGreaterThan(maxFp1);
    expect(fp2).toBe(maxFp2 - 10);
    expect(message.countIncludesText("おなかがふくれた。")).toBe(1);    // 前のメッセージ履歴
    expect(message.countIncludesText("最大満腹度が 2 増えた")).toBe(1);
});



test("concretes.item.food.CorrodedFood", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    const hp1 = player1.actualParam(MRBasics.params.hp);
    const pow1 = player1.actualParam(MRBasics.params.pow);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_腐食したフランスパン_A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_腐食したフランスパン_A").id, [], "item2"));
    inventory1.addEntity(item1);
    inventory1.addEntity(item2);
    
    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 15, 10);
    const enemy1Hp1 = enemy1.actualParam(MRBasics.params.hp);
    const enemy1Pow1 = enemy1.actualParam(MRBasics.params.pow);

    // おなかを減らしておく
    player1.setActualParam(MRBasics.params.fp, 2000);    // 20%

    TestUtils.testCommonFood(item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [食べる]
    TestUtils.submitActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 食べられたので消滅済み
    expect(item1.isDestroyed()).toBeTruthy();

    const message = REGame.messageHistory;
    const hp2 = player1.actualParam(MRBasics.params.hp);
    const pow2 = player1.actualParam(MRBasics.params.pow);
    expect(player1.actualParam(MRBasics.params.fp)).toBeGreaterThan(2000);// FP が回復しているはず。
    expect(hp2).toBeLessThan(hp1);          // ダメージをうける
    expect(pow2).toBeLessThan(pow1);        // ちからが減る
    expect(message.includesText("おなかがいっぱいになった。")).toBeTruthy();
});


