import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { REData } from "ts/data/REData";
import { LMoveAdjacentActivity } from "ts/objects/activities/LMoveAdjacentActivity";
import { LPickActivity } from "ts/objects/activities/LPickActivity";
import { LPutActivity } from "ts/objects/activities/LPutActivity";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { BlockLayerKind, TileShape } from "ts/objects/LBlock";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { REGameManager } from "ts/system/REGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "./TestEnv";
import { DEntity } from "ts/data/DEntity";
import { SActivityFactory } from "ts/system/SActivityFactory";
import { SMomementCommon } from "ts/system/SMomementCommon";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test('Activity.Eat', () => {
    REGameManager.createGameObjects();

    // actor1
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1._name = "actor1";
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);

    // アイテム作成
    const entityData: DEntity = { prefabId: TestEnv.PrefabId_Herb, stateIds: [] };
    const item1 = SEntityFactory.newEntity(entityData);

    // インベントリに入れる
    actor1.getBehavior(LInventoryBehavior).addEntity(item1);

    TestEnv.performFloorTransfer();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [食べる] Post
    const activity = SActivityFactory.newActivity(DBasics.actions.EatActionId);
    activity._setup(actor1, item1);
    RESystem.dialogContext.postActivity(activity);
    RESystem.dialogContext.closeDialog(true);
    
    // [食べる] 実行
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // インベントリから消えていること。
    expect(actor1.getBehavior(LInventoryBehavior).entities().length).toBe(0);
});

test('Activity.Throw', () => {
    REGameManager.createGameObjects();

    // actor1
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1._name = "actor1";
    actor1.dir = 6; // 右を向く
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    // アイテムを作ってインベントリに入れる
    const entityData: DEntity = { prefabId: TestEnv.PrefabId_Herb, stateIds: [] };
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
    RESystem.dialogContext.closeDialog(true);
    
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
    RESystem.dialogContext.closeDialog(true);
    
    // [投げる] 実行 (壁に当たって落下)
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // インベントリから消えていること。
    expect(actor1.getBehavior(LInventoryBehavior).entities().length).toBe(0);

    // 壁の手前に落ちていること
    expect(item2.x).toBe(actor1.x);
    expect(item2.y).toBe(actor1.y + 1);
    expect(item2.layer()).toBe(BlockLayerKind.Ground);
});

/*
test('Activity.ThrowAndCollide', () => {
    REGameManager.createGameObjects();

    // actor1
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1._name = "actor1";
    actor1.dir = 6; // 右を向く
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();
    
    // enemy1
    const enemy1 = SEntityFactory.newMonster(1);
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 12, 10);

    // アイテムを作ってインベントリに入れる
    const entityData: DEntity = { prefabId: TestEnv.PrefabId_Herb, stateIds: [] };
    const item1 = SEntityFactory.newEntity(entityData);
    actor1.getBehavior(LInventoryBehavior).addEntity(item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [投げる] Post
    const activity = SActivityFactory.newActivity(DBasics.actions.ThrowActionId);
    activity._setup(actor1, item1);
    RESystem.dialogContext.postActivity(activity);
    RESystem.dialogContext.closeDialog(true);
    
    // [投げる] 実行
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // インベントリから消えていること。
    expect(actor1.getBehavior(LInventoryBehavior).entities().length).toBe(1);

    // とりあえず、Actor 位置より右に落ちること。
    expect(item1.x > 10).toBe(true);
    expect(item1.layer()).toBe(BlockLayerKind.Ground);
});
*/
