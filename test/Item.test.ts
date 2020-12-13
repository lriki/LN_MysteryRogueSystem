import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { REData } from "ts/data/REData";
import { LUnitAttribute } from "ts/objects/attributes/LUnitAttribute";
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
    //--------------------
    // 準備
    REGameManager.createGameObjects();

    // actor1
    const actor1 = REGame.world.entity(REGame.system._mainPlayerEntityId);
    actor1._name = "actor1";
    REGame.world._transferEntity(actor1, 1, 5, 1);  // (5, 1) へ配置

    // item1
    const item1 = REEntityFactory.newItem(1);
    item1._name = "item1";
    REGame.world._transferEntity(item1, 1, 6, 1);  // (6, 1) へ配置。デフォルトの追加先レイヤーは Ground.

    // マップ移動
    REGameManager.performFloorTransfer();
    REGameManager.update();
    
    // player を右へ移動
    const dialogContext = REGame.scheduler._getDialogContext();
    dialogContext.postAction(DBasics.actions.MoveToAdjacentActionId, actor1, undefined, { direction: 6 });
    dialogContext.closeDialog(true);
    
    REGameManager.update(); // Step Simulation --------------------------------------------------

    // 足元のアイテムを拾う
    dialogContext.postAction(DBasics.actions.PickActionId, actor1, undefined);
    dialogContext.closeDialog(true);
    
    REGameManager.update(); // Step Simulation --------------------------------------------------

    const inventory = actor1.findBehavior(LInventoryBehavior);
    assert(inventory);

    // item1 は Map 上から外れている
    const block = REGame.map.block(6, 1);
    expect(block.layer(BlockLayerKind.Ground).isContains(item1)).toBe(false);

    // item1 がインベントリに追加されている
    expect(inventory.entities().length).toBe(1);
    expect(inventory.entities()[0]).toBe(item1);

    // item1 を置く
    dialogContext.postAction(DBasics.actions.PutActionId, actor1, item1);
    dialogContext.closeDialog(true);

    REGameManager.update(); // Step Simulation --------------------------------------------------

    // item1 は Map 上に追加されている
    expect(block.layer(BlockLayerKind.Ground).isContains(item1)).toBe(true);

    // item1 はインベントリから外れている
    expect(inventory.entities.length).toBe(0);
});
