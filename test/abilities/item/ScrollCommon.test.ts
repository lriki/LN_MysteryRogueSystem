import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Item.ScrollCommon", () => {
    TestEnv.newGame();

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();
    const inventory = actor1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_エスケープスクロール_A").id));
    item1._name = "item1";
    inventory.addEntity(item1);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
        
    // [読む]
    const activity2 = LActivity.makeRead(actor1, item1).withConsumeAction();
    RESystem.dialogContext.postActivity(activity2);
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    //expect(actor1.floorId.floorNumber()).toBe(0);
});
