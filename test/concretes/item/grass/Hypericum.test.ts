import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/objects/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { LActionTokenType } from "ts/mr/objects/LActionToken";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.Hypericum.player", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    
    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 15, 10);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_エリクシール_A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_エリクシール_A").id, [], "item2"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    TestUtils.testCommonGrassBegin(player1, item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    const player1HpMax1 = player1.idealParam(MRBasics.params.hp);
    
    // [食べる] (HP Max)
    RESystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 最大HPが増えている
    const player1HpMax2 = player1.idealParam(MRBasics.params.hp);
    expect(player1HpMax2).toBeGreaterThan(player1HpMax1);
    expect(REGame.messageHistory.includesText("最大HP")).toBeTruthy();
    expect(REGame.messageHistory.includesText("増えた")).toBeTruthy();  // "回復した" ではないこと

    TestUtils.testCommonGrassEnd(player1, item1);

    //----------------------------------------------------------------------------------------------------

    // 適当に HP を減らしておく
    player1.setActualParam(MRBasics.params.hp, Math.max(player1HpMax1 - 50, 1));
    const player1Hp1 = player1.actualParam(MRBasics.params.hp);
    
    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(player1, item2).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // HPが回復している
    const player1Hp2 = player1.actualParam(MRBasics.params.hp);
    expect(player1Hp2).toBeGreaterThan(player1Hp1 + 5); // 自動回復も行われるので、少し offset つける
});

test("concretes.item.grass.Hypericum.enemy", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    
    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 15, 10);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_エリクシール_A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_エリクシール_A").id, [], "item2"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    const enemy1HpMax1 = enemy1.idealParam(MRBasics.params.hp);
    
    // [投げる] (HP Max)
    RESystem.dialogContext.postActivity(LActivity.makeThrow(player1, item1).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 最大HPは変わらない
    const enemy1HpMax2 = enemy1.idealParam(MRBasics.params.hp);
    expect(enemy1HpMax2).toBe(enemy1HpMax1);

    //----------------------------------------------------------------------------------------------------

    // 適当に HP を減らしておく
    enemy1.setActualParam(MRBasics.params.hp, Math.max(enemy1HpMax1 - 50, 1));
    const enemy1Hp1 = enemy1.actualParam(MRBasics.params.hp);
    
    // [投げる]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(player1, item2).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // HPが回復している
    const enemy1Hp2 = enemy1.actualParam(MRBasics.params.hp);
    expect(enemy1Hp2).toBeGreaterThan(enemy1Hp1);
});

test("concretes.item.grass.Hypericum.undead", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    
    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_ゾンビA").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 15, 10);
    const enemy1Hp1 = enemy1.actualParam(MRBasics.params.hp);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_エリクシール_A").id, [], "item1"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [投げる]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(player1, item1).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // ダメージを受けている
    const enemy2Hp1 = enemy1.actualParam(MRBasics.params.hp);
    expect(enemy2Hp1).toBeLessThan(enemy1Hp1);
});

