import { assert } from "ts/re/Common";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "./../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { DBlockLayerKind } from "ts/re/data/DCommon";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("activity.PickAndPut", () => {
    // New Game
    TestEnv.newGame();

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);  // (5, 5) へ配置

    // item1 生成&配置
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    item1._name = "item1";
    REGame.world._transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 6, 5);  // (6, 5) へ配置。Item のデフォルトの追加先レイヤーは Ground.

    // マップ移動
    TestEnv.performFloorTransfer();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // player を右へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();    // 行動確定
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 足元のアイテムを拾う
    RESystem.dialogContext.postActivity(LActivity.makePick(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();    // 行動確定
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const inventory = actor1.findEntityBehavior(LInventoryBehavior);
    assert(inventory);

    // item1 は Map 上から外れている
    const block = REGame.map.block(6, 5);
    expect(block.layer(DBlockLayerKind.Ground).isContains(item1)).toBe(false);

    // item1 がインベントリに追加されている
    expect(inventory.entities().length).toBe(1);
    expect(inventory.entities()[0]).toBe(item1);

    //----------------------------------------------------------------------------------------------------

    // item1 を置く
    RESystem.dialogContext.postActivity(LActivity.makePut(actor1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();    // 行動確定

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // item1 は Map 上に追加されている
    expect(block.layer(DBlockLayerKind.Ground).isContains(item1)).toBe(true);

    // item1 はインベントリから外れている
    expect(inventory.entities.length).toBe(0);
});

test("activity.PickAtMoved", () => {
    // New Game
    TestEnv.newGame();

    // actor1 配置
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);

    // item1 生成&配置
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    item1._name = "item1";
    REGame.world._transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    // enemy1 (ターン経過チェック用)
    const enemy1 = SEntityFactory.newMonster(REData.enemyEntity(1));
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 20, 10);

    // マップ移動
    //TestEnv.performFloorTransfer();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右へ移動
    const dialogContext = RESystem.dialogContext;
    dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
    dialogContext.activeDialog().submit();    // 行動確定

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(enemy1.x).toBe(19);  // enemy は動いていない (ターンは回っていない)
    expect(actor1.getEntityBehavior(LInventoryBehavior).entities()[0]).toBe(item1);   // アイテムを拾えていること

    // Item は移動アニメの後に Map から除外されること
    const records = TestEnv.integration.records;
    const r1 = records.findIndex(x => x.type == "onFlushSequelSet");
    const r2 = records.findIndex(x => x.type == "onEntityLeavedMap");
    expect(r1 < r2).toBeTruthy();
});
