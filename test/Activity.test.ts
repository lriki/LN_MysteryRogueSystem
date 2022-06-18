import { MRBasics } from "ts/mr/data/MRBasics";
import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/objects/REGame";
import { LTileShape } from "ts/mr/objects/LBlock";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "./TestEnv";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { SDebugHelpers } from "ts/mr/system/SDebugHelpers";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { DBlockLayerKind } from "ts/mr/data/DCommon";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Activity.Eat", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);

    // アイテム作成
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));

    // インベントリに入れる
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    TestEnv.performFloorTransfer();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [食べる] Post
    const activity = LActivity.makeEat(actor1, item1).withConsumeAction();
    RESystem.dialogContext.postActivity(activity);
    RESystem.dialogContext.activeDialog().submit();
    
    // [食べる] 実行
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // インベントリから消えていること。
    expect(actor1.getEntityBehavior(LInventoryBehavior).items.length).toBe(0);
});

// [交換]
test("Activity.Exchange", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1.dir = 6; // 右を向く
    REGame.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = actor1.getEntityBehavior(LInventoryBehavior);
    TestEnv.performFloorTransfer();

    // アイテムを作ってインベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    item1._name = "item1";
    inventory.addEntity(item1);

    // 足元にアイテムを作る
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    item2._name = "item2";
    REGame.world.transferEntity(item2, TestEnv.FloorId_FlatMap50x50, 10, 10);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [交換]
    const activity = LActivity.makeExchange(actor1, item1).withConsumeAction();
    RESystem.dialogContext.postActivity(activity);
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(inventory.items.length).toBe(1);
    expect(inventory.contains(item2)).toBe(true);                          // item2 が持ち物に入っている
    expect(REGame.map.block(10, 10).containsEntity(item1)).toBe(true);  // item1 が足元にある
});

