import { MRBasics } from "ts/re/data/MRBasics";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { LTileShape } from "ts/re/objects/LBlock";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../TestEnv";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { SDebugHelpers } from "ts/re/system/SDebugHelpers";
import { MRData } from "ts/re/data/MRData";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { DBlockLayerKind } from "ts/re/data/DCommon";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("activity.Throw", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1.dir = 6; // 右を向く
    REGame.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    // アイテムを作ってインベントリに入れる
    const entityData = DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb);
    const item1 = SEntityFactory.newEntity(entityData);
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    const item2 = SEntityFactory.newEntity(entityData);
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    // 投げ当てテスト用に壁を作る
    REGame.map.block(actor1.mx, actor1.my + 2)._tileShape = LTileShape.Wall;

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [投げる] Post
    RESystem.dialogContext.postActivity(LActivity.makeThrow(actor1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    // [投げる] 実行 (自然落下)
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // インベントリから消えていること。
    expect(actor1.getEntityBehavior(LInventoryBehavior).items.length).toBe(1);

    // とりあえず、Actor 位置より右に落ちること。
    expect(item1.mx).toBe(20);
    expect(item1.layer()).toBe(DBlockLayerKind.Ground);

    // 下を向く
    actor1.dir = 2;

    // [投げる] Post
    const activity2 = LActivity.makeThrow(actor1, item2).withConsumeAction();
    RESystem.dialogContext.postActivity(activity2);
    RESystem.dialogContext.activeDialog().submit();
    
    // [投げる] 実行 (壁に当たって落下)
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // インベントリから消えていること。
    expect(actor1.getEntityBehavior(LInventoryBehavior).items.length).toBe(0);

    // 壁の手前に落ちていること
    expect(item2.mx).toBe(actor1.mx);
    expect(item2.my).toBe(actor1.my + 1);
    expect(item2.layer()).toBe(DBlockLayerKind.Ground);
});


test("activity.ThrowAndHit", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1.dir = 6; // 右を向く
    REGame.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 12, 10);
    SDebugHelpers.setHP(enemy1, 1); // HP1

    // アイテムを作ってインベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [投げる] Post
    const activity = LActivity.makeThrow(actor1, item1).withConsumeAction();
    RESystem.dialogContext.postActivity(activity);
    RESystem.dialogContext.activeDialog().submit();
    
    // [投げる] 実行
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(item1.isDestroyed()).toBe(true);     // item は削除されている
    const a = enemy1.actualParam(MRBasics.params.hp);
    expect(enemy1.actualParam(MRBasics.params.hp) > 1).toBe(true); // HP が回復していること。
});
