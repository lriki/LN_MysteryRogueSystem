import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { REData } from "ts/data/REData";
import { LMoveAdjacentActivity } from "ts/objects/activities/LMoveAdjacentActivity";
import { LPickActivity } from "ts/objects/activities/LPickActivity";
import { LPutActivity } from "ts/objects/activities/LPutActivity";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { BlockLayerKind } from "ts/objects/LBlock";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "./TestEnv";
import { DEntity } from "ts/data/DEntity";
import { SActivityFactory } from "ts/system/SActivityFactory";
import { DialogSubmitMode } from "ts/system/SDialog";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("PickAndPut", () => {
    // New Game
    SGameManager.createGameObjects();

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);  // (5, 5) へ配置

    // item1 生成&配置
    const item1 = SEntityFactory.newEntity({ prefabId: TestEnv.PrefabId_Herb, stateIds: [] });
    item1._name = "item1";
    REGame.world._transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 6, 5);  // (6, 5) へ配置。Item のデフォルトの追加先レイヤーは Ground.

    // マップ移動
    TestEnv.performFloorTransfer();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // player を右へ移動
    const dialogContext = RESystem.dialogContext;
    dialogContext.postActivity(LMoveAdjacentActivity.make(actor1, 6));
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);    // 行動確定
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 足元のアイテムを拾う
    dialogContext.postActivity(LPickActivity.make(actor1));
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
    dialogContext.postActivity(LPutActivity.make(actor1, item1));
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);    // 行動確定

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // item1 は Map 上に追加されている
    expect(block.layer(BlockLayerKind.Ground).isContains(item1)).toBe(true);

    // item1 はインベントリから外れている
    expect(inventory.entities.length).toBe(0);
});

test("PickAtMoved", () => {
    // New Game
    SGameManager.createGameObjects();

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);  // (5, 5) へ配置

    // item1 生成&配置
    const item1 = SEntityFactory.newEntity({ prefabId: TestEnv.PrefabId_Herb, stateIds: [] });
    item1._name = "item1";
    REGame.world._transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    // enemy1 (ターン経過チェック用)
    const enemy1 = SEntityFactory.newMonster(1);
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 20, 10);

    // マップ移動
    TestEnv.performFloorTransfer();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // player を右へ移動
    const dialogContext = RESystem.dialogContext;
    dialogContext.postActivity(LMoveAdjacentActivity.make(actor1, 6));
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);    // 行動確定
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(actor1.immediatelyAfterAdjacentMoving).toBe(true);   // 足元 Entity に対する Action 要求が来ていること
    expect(enemy1.x).toBe(19);  // enemy は 1歩近づいてきている

    // 足元のアイテムを拾う
    dialogContext.postActivity(LPickActivity.make(actor1));
    dialogContext.postReopen();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.x).toBe(19);  // enemy は動いていない (ターンは回っていない)
    expect(actor1.getBehavior(LInventoryBehavior).entities()[0]).toBe(item1);   // アイテムを拾えていること
});
