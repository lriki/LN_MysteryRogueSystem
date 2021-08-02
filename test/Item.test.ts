import { assert } from "ts/Common";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { BlockLayerKind } from "ts/objects/LBlockLayer";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "./TestEnv";
import { DialogSubmitMode } from "ts/system/SDialog";
import { REData } from "ts/data/REData";
import { DBasics } from "ts/data/DBasics";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { LActivity } from "ts/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("PickAndPut", () => {
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

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // player を右へ移動
    const dialogContext = RESystem.dialogContext;
    dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6));
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);    // 行動確定
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 足元のアイテムを拾う
    dialogContext.postActivity(LActivity.makePick(actor1));
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);    // 行動確定
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    const inventory = actor1.findBehavior(LInventoryBehavior);
    assert(inventory);

    // item1 は Map 上から外れている
    const block = REGame.map.block(6, 5);
    expect(block.layer(BlockLayerKind.Ground).isContains(item1)).toBe(false);

    // item1 がインベントリに追加されている
    expect(inventory.entities().length).toBe(1);
    expect(inventory.entities()[0]).toBe(item1);

    // item1 を置く
    dialogContext.postActivity(LActivity.makePut(actor1, item1));
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);    // 行動確定

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // item1 は Map 上に追加されている
    expect(block.layer(BlockLayerKind.Ground).isContains(item1)).toBe(true);

    // item1 はインベントリから外れている
    expect(inventory.entities.length).toBe(0);
});

test("PickAtMoved", () => {
    // New Game
    TestEnv.newGame();

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);  // (5, 5) へ配置

    // item1 生成&配置
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    item1._name = "item1";
    REGame.world._transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    // enemy1 (ターン経過チェック用)
    const enemy1 = SEntityFactory.newMonster(REData.enemyEntity(1));
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 20, 10);

    // マップ移動
    TestEnv.performFloorTransfer();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // player を右へ移動
    const dialogContext = RESystem.dialogContext;
    dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6));
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);    // 行動確定
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(actor1.immediatelyAfterAdjacentMoving).toBe(true);   // 足元 Entity に対する Action 要求が来ていること
    expect(enemy1.x).toBe(19);  // enemy は 1歩近づいてきている

    // 足元のアイテムを拾う
    dialogContext.postActivity(LActivity.makePick(actor1));
    dialogContext.postReopen();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.x).toBe(19);  // enemy は動いていない (ターンは回っていない)
    expect(actor1.getBehavior(LInventoryBehavior).entities()[0]).toBe(item1);   // アイテムを拾えていること
});

test("Item.ThrowAndDrop", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1.dir = 6;
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);
    TestEnv.performFloorTransfer();

    // アイテムを作ってインベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    actor1.getBehavior(LInventoryBehavior).addEntity(item1);
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    actor1.getBehavior(LInventoryBehavior).addEntity(item2);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // [投げる]
    const activity1 = LActivity.makeThrow(actor1, item1);
    RESystem.dialogContext.postActivity(activity1);
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // [投げる]
    const activity2 = LActivity.makeThrow(actor1, item2);
    RESystem.dialogContext.postActivity(activity2);
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // item1 と item2 は違うところに落ちたはず
    expect(item1.x != item2.x || item1.y != item2.y).toBe(true);
});

test("Item.DropAndDestroy", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1.dir = 6;
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);
    TestEnv.performFloorTransfer();

    // アイテムを作ってインベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    actor1.getBehavior(LInventoryBehavior).addEntity(item1);

    // 床にアイテムを敷き詰める
    const ox = 7//10;
    const oy = 2//5;
    for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
            const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
            REGame.world._transferEntity(item, TestEnv.FloorId_FlatMap50x50, ox + x, oy + y);
        }
    }

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // [投げる]
    const activity1 = LActivity.makeThrow(actor1, item1);
    RESystem.dialogContext.postActivity(activity1);
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // 置くところが無いので削除される
    expect(item1.isDestroyed()).toBe(true);
});

test("Items.Stack", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();
    const inventory = actor1.getBehavior(LInventoryBehavior);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 矢1本
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kウッドアロー").id));
    REGame.world._transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 10, 10);  // Player の足元へ

    // 足元のアイテムを拾う
    RESystem.dialogContext.postActivity(LActivity.makePick(actor1));
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 矢2本
    const info2 = DEntityCreateInfo.makeSingle(REData.getEntity("kウッドアロー").id);
    info2.stackCount = 2;
    const item2 = SEntityFactory.newEntity(info2);
    REGame.world._transferEntity(item2, TestEnv.FloorId_FlatMap50x50, 10, 10);  // Player の足元へ

    // 足元のアイテムを拾う
    RESystem.dialogContext.postActivity(LActivity.makePick(actor1));
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(item1._stackCount).toBe(3);  // 3本にまとめられている

    // 矢99本
    const info3 = DEntityCreateInfo.makeSingle(REData.getEntity("kウッドアロー").id);
    info2.stackCount = 99;
    const item3 = SEntityFactory.newEntity(info2);
    REGame.world._transferEntity(item3, TestEnv.FloorId_FlatMap50x50, 10, 10);  // Player の足元へ

    // 足元のアイテムを拾う
    RESystem.dialogContext.postActivity(LActivity.makePick(actor1));
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(item1._stackCount).toBe(99);  // 99本が最大

    // 矢1本
    const item4 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kウッドアロー").id));
    REGame.world._transferEntity(item4, TestEnv.FloorId_FlatMap50x50, 10, 10);  // Player の足元へ

    // 足元のアイテムを拾う
    RESystem.dialogContext.postActivity(LActivity.makePick(actor1));
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(item1._stackCount).toBe(99);  // 99本が最大

    expect(item2.isDestroyed()).toBe(true); // item1 へスタックされ、item2 自体は消える
    expect(item3.isDestroyed()).toBe(true); // item1 へスタックされ、item3 自体は消える
    expect(item4.isDestroyed()).toBe(true); // item1 へスタックされ、item4 自体は消える
});

