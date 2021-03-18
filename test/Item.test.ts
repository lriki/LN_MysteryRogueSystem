import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { REData } from "ts/data/REData";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { BlockLayerKind } from "ts/objects/REGame_Block";
import { REEntityFactory } from "ts/system/REEntityFactory";
import { REGameManager } from "ts/system/REGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "./TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test('PickAndPut', () => {
    // New Game
    REGameManager.createGameObjects();

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system._mainPlayerEntityId);
    actor1._name = "actor1";
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);  // (5, 5) へ配置

    // item1 生成&配置
    const item1 = REEntityFactory.newItem(REData.getItem("kItem_Herb").id);
    item1._name = "item1";
    REGame.world._transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 6, 5);  // (6, 5) へ配置。Item のデフォルトの追加先レイヤーは Ground.

    // マップ移動
    TestEnv.performFloorTransfer();

    REGame.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // player を右へ移動
    const dialogContext = RESystem.dialogContext;
    dialogContext.postAction(DBasics.actions.MoveToAdjacentActionId, actor1, undefined, { direction: 6 });
    dialogContext.closeDialog(true);    // 行動確定
    
    REGame.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 足元のアイテムを拾う
    dialogContext.postAction(DBasics.actions.PickActionId, actor1, undefined);
    dialogContext.closeDialog(true);    // 行動確定
    
    REGame.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    const inventory = actor1.findBehavior(LInventoryBehavior);
    assert(inventory);

    // item1 は Map 上から外れている
    const block = REGame.map.block(6, 5);
    expect(block.layer(BlockLayerKind.Ground).isContains(item1)).toBe(false);

    // item1 がインベントリに追加されている
    expect(inventory.entities().length).toBe(1);
    expect(inventory.entities()[0]).toBe(item1);

    // item1 を置く
    dialogContext.postAction(DBasics.actions.PutActionId, actor1, item1);
    dialogContext.closeDialog(true);    // 行動確定

    REGame.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // item1 は Map 上に追加されている
    expect(block.layer(BlockLayerKind.Ground).isContains(item1)).toBe(true);

    // item1 はインベントリから外れている
    expect(inventory.entities.length).toBe(0);
});
