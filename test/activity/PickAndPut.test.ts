import { assert } from "ts/mr/Common";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "./../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { DBlockLayerKind } from "ts/mr/data/DCommon";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("activity.PickAndPut", () => {
    // New Game
    TestEnv.newGame();

    // actor1 配置
    const actor1 = MRLively.world.entity(MRLively.system.mainPlayerEntityId);
    MRLively.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);  // (5, 5) へ配置

    // item1 生成&配置
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb, [], "item1"));
    MRLively.world.transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 6, 5);  // (6, 5) へ配置。Item のデフォルトの追加先レイヤーは Ground.

    // マップ移動
    TestEnv.performFloorTransfer();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // player を右へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();    // 行動確定
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 足元のアイテムを拾う
    MRSystem.dialogContext.postActivity(LActivity.makePick(actor1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();    // 行動確定
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const inventory = actor1.findEntityBehavior(LInventoryBehavior);
    assert(inventory);

    // item1 は Map 上から外れている
    const block = MRLively.map.block(6, 5);
    expect(block.layer(DBlockLayerKind.Ground).isContains(item1)).toBe(false);

    // item1 がインベントリに追加されている
    expect(inventory.items.length).toBe(1);
    expect(inventory.items[0]).toBe(item1);

    //----------------------------------------------------------------------------------------------------

    // item1 を置く
    MRSystem.dialogContext.postActivity(LActivity.makePut(actor1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();    // 行動確定

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // item1 は Map 上に追加されている
    expect(block.layer(DBlockLayerKind.Ground).isContains(item1)).toBe(true);

    // item1 はインベントリから外れている
    expect(inventory.items.length).toBe(0);
});

test("activity.PickAtMoved", () => {
    // New Game
    TestEnv.newGame();

    // actor1 配置
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);

    // item1 生成&配置
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb, [], "item1"));
    MRLively.world.transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    // enemy1 (ターン経過チェック用)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 20, 10);

    // マップ移動
    //TestEnv.performFloorTransfer();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右へ移動
    const dialogContext = MRSystem.dialogContext;
    dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
    dialogContext.activeDialog().submit();    // 行動確定

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(enemy1.mx).toBe(19);  // enemy は動いていない (ターンは回っていない)
    expect(actor1.getEntityBehavior(LInventoryBehavior).items[0]).toBe(item1);   // アイテムを拾えていること

    // Item は移動アニメの後に Map から除外されること
    const records = TestEnv.integration.records;
    const r1 = records.findIndex(x => x.type == "onFlushSequelSet");
    const r2 = records.findIndex(x => x.type == "onEntityLeavedMap");
    expect(r1 < r2).toBeTruthy();
});

test("activity.PickAtMoved.Maximum", () => {
    // New Game
    TestEnv.newGame();

    // actor1 配置
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory1 = actor1.getEntityBehavior(LInventoryBehavior);

    // Item を最大まで持たせる
    for (let i = 0; i < inventory1.capacity; i++) {
        const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb, [], "item1"));
        inventory1.addEntity(item);
    }

    // item1 生成&配置
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb, [], "item1"));
    MRLively.world.transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右へ移動して拾う
    const dialogContext = MRSystem.dialogContext;
    dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
    dialogContext.activeDialog().submit();    // 行動確定

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const message = MRLively.messageHistory;

    const block = MRLively.map.block(11, 10);
    const item = block.layer(DBlockLayerKind.Ground).firstEntity();
    expect(item).toBe(item1);
    expect(message.includesText("薬草")).toBeTruthy();
    expect(message.includesText("乗った")).toBeTruthy();
});
