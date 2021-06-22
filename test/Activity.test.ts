import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { TileShape } from "ts/objects/LBlock";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "./TestEnv";
import { DEntityInstance } from "ts/data/DEntity";
import { SActivityFactory } from "ts/system/SActivityFactory";
import { SDebugHelpers } from "ts/system/SDebugHelpers";
import { LBattlerBehavior } from "ts/objects/behaviors/LBattlerBehavior";
import { DialogSubmitMode } from "ts/system/SDialog";
import { BlockLayerKind } from "ts/objects/LBlockLayer";
import { REData } from "ts/data/REData";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Activity.Eat", () => {
    SGameManager.createGameObjects();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);

    // アイテム作成
    const entityData: DEntityInstance = { prefabId: TestEnv.PrefabId_Herb, stateIds: [] };
    const item1 = SEntityFactory.newEntity(entityData);

    // インベントリに入れる
    actor1.getBehavior(LInventoryBehavior).addEntity(item1);

    TestEnv.performFloorTransfer();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [食べる] Post
    const activity = SActivityFactory.newActivity(DBasics.actions.EatActionId);
    activity._setup(actor1, item1);
    RESystem.dialogContext.postActivity(activity);
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    // [食べる] 実行
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // インベントリから消えていること。
    expect(actor1.getBehavior(LInventoryBehavior).entities().length).toBe(0);
});

test("Activity.Throw", () => {
    SGameManager.createGameObjects();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1.dir = 6; // 右を向く
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    // アイテムを作ってインベントリに入れる
    const entityData: DEntityInstance = { prefabId: TestEnv.PrefabId_Herb, stateIds: [] };
    const item1 = SEntityFactory.newEntity(entityData);
    actor1.getBehavior(LInventoryBehavior).addEntity(item1);
    const item2 = SEntityFactory.newEntity(entityData);
    actor1.getBehavior(LInventoryBehavior).addEntity(item2);

    // 投げ当てテスト用に壁を作る
    REGame.map.block(actor1.x, actor1.y + 2)._tileShape = TileShape.Wall;

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [投げる] Post
    const activity = SActivityFactory.newActivity(DBasics.actions.ThrowActionId);
    activity._setup(actor1, item1);
    RESystem.dialogContext.postActivity(activity);
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    // [投げる] 実行 (自然落下)
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // インベントリから消えていること。
    expect(actor1.getBehavior(LInventoryBehavior).entities().length).toBe(1);

    // とりあえず、Actor 位置より右に落ちること。
    expect(item1.x > 10).toBe(true);
    expect(item1.layer()).toBe(BlockLayerKind.Ground);

    // 下を向く
    actor1.dir = 2;

    // [投げる] Post
    const activity2 = SActivityFactory.newActivity(DBasics.actions.ThrowActionId);
    activity2._setup(actor1, item2);
    RESystem.dialogContext.postActivity(activity2);
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    // [投げる] 実行 (壁に当たって落下)
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // インベントリから消えていること。
    expect(actor1.getBehavior(LInventoryBehavior).entities().length).toBe(0);

    // 壁の手前に落ちていること
    expect(item2.x).toBe(actor1.x);
    expect(item2.y).toBe(actor1.y + 1);
    expect(item2.layer()).toBe(BlockLayerKind.Ground);
});


test("Activity.ThrowAndHit", () => {
    SGameManager.createGameObjects();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1.dir = 6; // 右を向く
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();
    
    // enemy1
    const enemy1 = SEntityFactory.newMonster(REData.enemyEntity(1));
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 12, 10);
    SDebugHelpers.setHP(enemy1, 1); // HP1

    // アイテムを作ってインベントリに入れる
    const entityData: DEntityInstance = { prefabId: TestEnv.PrefabId_Herb, stateIds: [] };
    const item1 = SEntityFactory.newEntity(entityData);
    actor1.getBehavior(LInventoryBehavior).addEntity(item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [投げる] Post
    const activity = SActivityFactory.newActivity(DBasics.actions.ThrowActionId);
    activity._setup(actor1, item1);
    RESystem.dialogContext.postActivity(activity);
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    // [投げる] 実行
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(item1.isDestroyed()).toBe(true);     // item は削除されている
    expect(enemy1.getBehavior(LBattlerBehavior).actualParam(DBasics.params.hp) > 1).toBe(true); // HP が回復していること。
});

// [交換]
test("Activity.Exchange", () => {
    SGameManager.createGameObjects();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1.dir = 6; // 右を向く
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = actor1.getBehavior(LInventoryBehavior);
    TestEnv.performFloorTransfer();

    // アイテムを作ってインベントリに入れる
    const item1 = SEntityFactory.newEntity({ prefabId: TestEnv.PrefabId_Herb, stateIds: [] });
    item1._name = "item1";
    inventory.addEntity(item1);

    // 足元にアイテムを作る
    const item2 = SEntityFactory.newEntity({ prefabId: TestEnv.PrefabId_Herb, stateIds: [] });
    item2._name = "item2";
    REGame.world._transferEntity(item2, TestEnv.FloorId_FlatMap50x50, 10, 10);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [交換]
    const activity = SActivityFactory.newActivity(DBasics.actions.ExchangeActionId);
    activity._setup(actor1, item1);
    RESystem.dialogContext.postActivity(activity);
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(inventory.entities().length).toBe(1);
    expect(inventory.contains(item2)).toBe(true);                          // item2 が持ち物に入っている
    expect(REGame.map.block(10, 10).containsEntity(item1)).toBe(true);  // item1 が足元にある
});

