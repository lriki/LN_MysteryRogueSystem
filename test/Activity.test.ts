import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "./TestEnv";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Activity.Eat", () => {
    TestEnv.newGame();

    // Player
    const actor1 = MRLively.world.entity(MRLively.system.mainPlayerEntityId);
    MRLively.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);

    // アイテム作成
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));

    // インベントリに入れる
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    TestEnv.performFloorTransfer();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [食べる] Post
    const activity = LActivity.makeEat(actor1, item1).withConsumeAction();
    MRSystem.dialogContext.postActivity(activity);
    MRSystem.dialogContext.activeDialog().submit();
    
    // [食べる] 実行
    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // インベントリから消えていること。
    expect(actor1.getEntityBehavior(LInventoryBehavior).items.length).toBe(0);
});

// [交換]
test("Activity.Exchange", () => {
    TestEnv.newGame();

    // Player
    const actor1 = MRLively.world.entity(MRLively.system.mainPlayerEntityId);
    actor1.dir = 6; // 右を向く
    MRLively.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = actor1.getEntityBehavior(LInventoryBehavior);
    TestEnv.performFloorTransfer();

    // アイテムを作ってインベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    item1._name = "item1";
    inventory.addEntity(item1);

    // 足元にアイテムを作る
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    item2._name = "item2";
    MRLively.world.transferEntity(item2, TestEnv.FloorId_FlatMap50x50, 10, 10);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [交換]
    const activity = LActivity.makeExchange(actor1, item1).withConsumeAction();
    MRSystem.dialogContext.postActivity(activity);
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(inventory.items.length).toBe(1);
    expect(inventory.contains(item2)).toBe(true);                          // item2 が持ち物に入っている
    expect(MRLively.map.block(10, 10).containsEntity(item1)).toBe(true);  // item1 が足元にある
});

