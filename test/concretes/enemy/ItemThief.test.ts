import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { SDebugHelpers } from "ts/mr/system/SDebugHelpers";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LActionTokenType } from "ts/mr/lively/LActionToken";
import { assert } from "ts/mr/Common";
import { LItemBehavior } from "ts/mr/lively/behaviors/LItemBehavior";

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
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    inventory1.addEntity(item1);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_瑠璃猫A").id, [], "enemy1"));
    MRLively.world.transferEntity(undefined, enemy1, floorId, 12, 10);
    const inventory2 = enemy1.getEntityBehavior(LInventoryBehavior);
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // Enemy の目の前へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRLively.world.random().resetSeed(9);     // 乱数調整
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // Player のインベントリにあったアイテムが盗まれ、Enemy のインベントリに移動している
    expect(inventory1.items.length).toBe(0);
    expect(inventory2.items.length).toBe(1);
    expect(inventory2.contains(item1)).toBe(true);

    // Enemy1 はワープしている
    expect(enemy1.mx != 12 && enemy1.my != 10).toBe(true);

    //----------------------------------------------------------------------------------------------------

    // Enemy を攻撃して倒す
    enemy1.setParamCurrentValue(MRBasics.params.hp, 1);
    MRLively.world.transferEntity(undefined, enemy1, floorId, 12, 10);
    MRSystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, MRData.system.skills.normalAttack, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // Enemy は倒れ、足元に item が落ちている
    expect(enemy1.isDestroyed()).toBe(true);
    expect(item1.floorId.equals(floorId)).toBe(true);
    expect(item1.mx).toBe(12);
    expect(item1.my).toBe(10);
});


test("concretes.enemy.ItemThief.GroundItem", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_瑠璃猫A").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 12, 10);
    const inventory2 = enemy1.getEntityBehavior(LInventoryBehavior);

    // Item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    TestEnv.transferEntity(item1, floorId, 14, 10);

    // □□□□□
    // Ｐ□敵□草
    // □□□□□

    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 待機
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // Enemy1 はアイテムに向かって移動している
    expect(enemy1.mx == 13).toBe(true);
    expect(enemy1.my == 10).toBe(true);

    //----------------------------------------------------------------------------------------------------

    // 待機
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    enemy1.dir = 6; // TODO: 今はAIにバグがあるので
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

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
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_薬草A").id, [], "item2"));
    inventory1.addEntity(item2);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_瑠璃猫A").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 12, 10);
    const inventory2 = enemy1.getEntityBehavior(LInventoryBehavior);

    // Item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    TestEnv.transferEntity(item1, floorId, 14, 10);

    // □□□□□
    // Ｐ□敵□草
    // □□□□□
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 待機
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // Enemy1 はアイテムに向かって移動している
    expect(enemy1.mx == 13).toBe(true);
    expect(enemy1.my == 10).toBe(true);

    //----------------------------------------------------------------------------------------------------

    // 置く
    MRSystem.dialogContext.postActivity(LActivity.makePut(player1, item2).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // Enemy1 は新しいアイテムに向かって移動している
    expect(enemy1.mx == 12).toBe(true);
    expect(enemy1.my == 10).toBe(true);
});

test("concretes.enemy.ItemThief.DropItem", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    player1.addState(TestEnv.StateId_CertainDirectAttack);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_瑠璃猫A").id, [], "enemy1"));
    MRLively.world.transferEntity(undefined, enemy1, floorId, 11, 10);
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    
    // Enemy を攻撃して倒す
    enemy1.setParamCurrentValue(MRBasics.params.hp, 1);
    MRSystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, MRData.system.skills.normalAttack, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // Enemy は倒れ、足元に item が落ちている。ドロップ率 100%
    expect(enemy1.isDestroyed()).toBe(true);
    const item = MRLively.camera.currentMap.block(11, 10).getFirstEntity();
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
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_瑠璃猫A").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 11, 10);
    const inventory2 = enemy1.getEntityBehavior(LInventoryBehavior);
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [装備]
    MRSystem.dialogContext.postActivity(LActivity.makeEquip(player1, weapon1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRLively.world.random().resetSeed(9);     // 乱数調整
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

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
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_瑠璃猫A").id, [], "enemy1"));
    MRLively.world.transferEntity(undefined, enemy1, floorId, 15, 10);

    // enemy2
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_瑠璃猫A").id, [], "enemy1"));
    MRLively.world.transferEntity(undefined, enemy2, floorId, 15, 11);
    
    // Item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    MRLively.world.transferEntity(undefined, item1, floorId, 16, 11);

    /*
    □□□□
    □敵草□
    □敵□□
    □□□□
    */

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    
    // 待機
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // enemy2 はメジャーアクションが取れなかった
    expect(enemy2.mx).toBe(15);
    expect(enemy2.my).toBe(11);
});

test("concretes.enemy.ItemThief.Issue3_Seal", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    player1.addState(TestEnv.StateId_CertainDirectAttack);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    
    // enemy1 (封印)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_瑠璃猫A").id, [], "enemy1"));
    enemy1.addState(MRData.getState("kState_System_Seal").id);
    const inventory2 = enemy1.getEntityBehavior(LInventoryBehavior);
    MRLively.world.transferEntity(undefined, enemy1, floorId, 11, 10);

    // Item1作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    inventory1.addEntity(item1);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    
    // 待機
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // アイテムは盗まれていないし、ワープもしていない
    expect(inventory1.items.length).toBe(1);
    expect(inventory2.items.length).toBe(0);
    expect(enemy1.mx).toBe(11);
    expect(enemy1.my).toBe(10);
});

// 部屋に階段しかないときに、それを目指して移動してしまう問題の修正
test("concretes.enemy.ItemThief.Issue4_IgnoreExitPoint", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 15, 10);
    player1.addState(TestEnv.StateId_CertainDirectAttack);
    
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_瑠璃猫A").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 10, 10);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------
    
    // [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(enemy1.mx).toBe(11);
});

test("concretes.enemy.ItemThief.Issue5_FootItem", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 17, 10);
    player1.addState(TestEnv.StateId_CertainDirectAttack);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_瑠璃猫A").id, [], "enemy1"));
    MRLively.world.transferEntity(undefined, enemy1, floorId, 15, 10);

    // enemy2
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    MRLively.world.transferEntity(undefined, enemy2, floorId, 16, 10);
    
    // Item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    MRLively.world.transferEntity(undefined, item1, floorId, 16, 10);

    /*
    □□□□
    □敵敵Ｐ ←右側の敵の下に草がある
    □□□□
    □□□□
    */

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    
    // 待機
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 床上のアイテムは盗まれていない
    expect(MRLively.camera.currentMap.block(16, 10).containsEntity(item1)).toBeTruthy();
    expect(enemy2.mx).toBe(16);
    expect(enemy2.my).toBe(10);

    const message = MRLively.messageHistory;
    expect(message.includesText("盗めなかった")).toBeFalsy();
});

test("concretes.enemy.ItemThief.Issue6_Moving", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;

    const player1 = TestEnv.setupPlayer(floorId, 2, 20);
    player1.addState(TestEnv.StateId_CertainDirectAttack);
    
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_瑠璃猫A").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 5, 21);
    enemy1.dir = 2;

    // アイテムを盗ませたことにして逃げ状態にする
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    enemy1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    /*
    ■■■■
    □□■■
    □□□□
    □□■■
    Ｐ敵□□  ← こんな感じの時に、敵は通路へ逃げてほしい。
    ■■■■
    */

    //----------------------------------------------------------------------------------------------------
    
    // [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 部屋の入口へ向かう
    expect(enemy1.mx).toBe(5);
    expect(enemy1.my).toBe(22);

    //----------------------------------------------------------------------------------------------------
    
    // [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 通路へ入る
    expect(enemy1.mx).toBe(6);
    expect(enemy1.my).toBe(22);
});
