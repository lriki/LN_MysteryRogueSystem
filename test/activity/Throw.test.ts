import { MRBasics } from "ts/mr/data/MRBasics";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { LTileShape } from "ts/mr/lively/LBlock";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../TestEnv";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { SDebugHelpers } from "ts/mr/system/SDebugHelpers";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { DBlockLayerKind } from "ts/mr/data/DCommon";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("activity.Throw", () => {
    TestEnv.newGame();

    // Player
    const actor1 = MRLively.world.entity(MRLively.system.mainPlayerEntityId);
    actor1.dir = 6; // 右を向く
    MRLively.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    // アイテムを作ってインベントリに入れる
    const entityData = DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb);
    const item1 = SEntityFactory.newEntity(entityData);
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    const item2 = SEntityFactory.newEntity(entityData);
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    // 投げ当てテスト用に壁を作る
    MRLively.map.block(actor1.mx, actor1.my + 2)._tileShape = LTileShape.Wall;

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [投げる] Post
    MRSystem.dialogContext.postActivity(LActivity.makeThrow(actor1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    // [投げる] 実行 (自然落下)
    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // インベントリから消えていること。
    expect(actor1.getEntityBehavior(LInventoryBehavior).items.length).toBe(1);

    // とりあえず、Actor 位置より右に落ちること。
    expect(item1.mx).toBe(20);
    expect(item1.layer()).toBe(DBlockLayerKind.Ground);

    // 下を向く
    actor1.dir = 2;

    // [投げる] Post
    const activity2 = LActivity.makeThrow(actor1, item2).withConsumeAction();
    MRSystem.dialogContext.postActivity(activity2);
    MRSystem.dialogContext.activeDialog().submit();
    
    // [投げる] 実行 (壁に当たって落下)
    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

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
    const actor1 = MRLively.world.entity(MRLively.system.mainPlayerEntityId);
    actor1.dir = 6; // 右を向く
    MRLively.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 12, 10);
    SDebugHelpers.setHP(enemy1, 1); // HP1

    // アイテムを作ってインベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [投げる] Post
    const activity = LActivity.makeThrow(actor1, item1).withConsumeAction();
    MRSystem.dialogContext.postActivity(activity);
    MRSystem.dialogContext.activeDialog().submit();
    
    // [投げる] 実行
    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(item1.isDestroyed()).toBe(true);     // item は削除されている
    const a = enemy1.getActualParam(MRBasics.params.hp);
    expect(enemy1.getActualParam(MRBasics.params.hp) > 1).toBe(true); // HP が回復していること。
});
