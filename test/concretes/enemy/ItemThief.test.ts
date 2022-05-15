import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { SDebugHelpers } from "ts/re/system/SDebugHelpers";
import { REBasics } from "ts/re/data/REBasics";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LActionTokenType } from "ts/re/objects/LActionToken";
import { assert } from "ts/re/Common";
import { LItemBehavior } from "ts/re/objects/behaviors/LItemBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemy.ItemThief.Basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    player1.addState(TestEnv.StateId_CertainDirectAttack);

    // Item1作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kEntity_キュアリーフ_A").id, [], "item1"));
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    inventory1.addEntity(item1);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_プレゼンにゃーA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 12, 10);
    const inventory2 = enemy1.getEntityBehavior(LInventoryBehavior);
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // Enemy の目の前へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction(LActionTokenType.Minor));
    RESystem.dialogContext.activeDialog().submit();
    
    REGame.world.random().resetSeed(9);     // 乱数調整
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // Player のインベントリにあったアイテムが盗まれ、Enemy のインベントリに移動している
    expect(inventory1.items.length).toBe(0);
    expect(inventory2.items.length).toBe(1);
    expect(inventory2.contains(item1)).toBe(true);

    // Enemy1 はワープしている
    expect(enemy1.x != 12 && enemy1.y != 10).toBe(true);

    //----------------------------------------------------------------------------------------------------

    // Enemy を攻撃して倒す
    enemy1.setActualParam(REBasics.params.hp, 1);
    REGame.world._transferEntity(enemy1, floorId, 12, 10);
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, RESystem.skills.normalAttack, 6).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // Enemy は倒れ、足元に item が落ちている
    expect(enemy1.isDestroyed()).toBe(true);
    expect(item1.floorId.equals(floorId)).toBe(true);
    expect(item1.x).toBe(12);
    expect(item1.y).toBe(10);
});


test("concretes.enemy.ItemThief.GroundItem", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_プレゼンにゃーA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 12, 10);
    const inventory2 = enemy1.getEntityBehavior(LInventoryBehavior);

    // Item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kEntity_キュアリーフ_A").id, [], "item1"));
    REGame.world._transferEntity(item1, floorId, 14, 10);

    // □□□□□
    // Ｐ□敵□草
    // □□□□□

    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // Enemy1 はアイテムに向かって移動している
    expect(enemy1.x == 13).toBe(true);
    expect(enemy1.y == 10).toBe(true);

    //----------------------------------------------------------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();

    enemy1.dir = 6; // TODO: 今はAIにバグがあるので
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 盗まれている
    expect(inventory2.items.length).toBe(1);
    expect(inventory2.contains(item1)).toBe(true);
});

// 新しいアイテムが床に置かれたら、そちらを目指す
test("concretes.enemy.ItemThief.NewGroundItem", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);

    // item2
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kEntity_キュアリーフ_A").id, [], "item2"));
    inventory1.addEntity(item2);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_プレゼンにゃーA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 12, 10);
    const inventory2 = enemy1.getEntityBehavior(LInventoryBehavior);

    // Item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kEntity_キュアリーフ_A").id, [], "item1"));
    REGame.world._transferEntity(item1, floorId, 14, 10);

    // □□□□□
    // Ｐ□敵□草
    // □□□□□
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // Enemy1 はアイテムに向かって移動している
    expect(enemy1.x == 13).toBe(true);
    expect(enemy1.y == 10).toBe(true);

    //----------------------------------------------------------------------------------------------------

    // 置く
    RESystem.dialogContext.postActivity(LActivity.makePut(player1, item2).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // Enemy1 は新しいアイテムに向かって移動している
    expect(enemy1.x == 12).toBe(true);
    expect(enemy1.y == 10).toBe(true);
});

test("concretes.enemy.ItemThief.DropItem", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    player1.addState(TestEnv.StateId_CertainDirectAttack);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_プレゼンにゃーA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 11, 10);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    
    // Enemy を攻撃して倒す
    enemy1.setActualParam(REBasics.params.hp, 1);
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, RESystem.skills.normalAttack, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // Enemy は倒れ、足元に item が落ちている。ドロップ率 100%
    expect(enemy1.isDestroyed()).toBe(true);
    const item = REGame.map.block(11, 10).getFirstEntity();
    assert(item);
    expect(!!item.findEntityBehavior(LItemBehavior)).toBe(true);
});

test("concretes.enemy.ItemThief.Equipment", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);

    // 武器 入手
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [], "weapon1"));
    inventory1.addEntity(weapon1);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_プレゼンにゃーA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 11, 10);
    const inventory2 = enemy1.getEntityBehavior(LInventoryBehavior);
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [装備]
    RESystem.dialogContext.postActivity(LActivity.makeEquip(player1, weapon1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    REGame.world.random().resetSeed(9);     // 乱数調整
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // Player のインベントリにあったアイテムが盗まれ、Enemy のインベントリに移動している
    expect(inventory1.items.length).toBe(1);
    expect(inventory2.items.length).toBe(0);
    expect(inventory1.contains(weapon1)).toBeTruthy();
})

// 2体のが同じ床落ちアイテムを盗もうとしたときにクラッシュする問題の修正確認
test("concretes.enemy.ItemThief.Issue2", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    player1.addState(TestEnv.StateId_CertainDirectAttack);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_プレゼンにゃーA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 15, 10);

    // enemy2
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_プレゼンにゃーA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy2, floorId, 15, 11);
    
    // Item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kEntity_キュアリーフ_A").id, [], "item1"));
    REGame.world._transferEntity(item1, floorId, 16, 11);

    /*
    □□□□
    □敵草□
    □敵□□
    □□□□
    */

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    
    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // enemy2 はメジャーアクションが取れなかった
    expect(enemy2.x).toBe(15);
    expect(enemy2.y).toBe(11);
});
