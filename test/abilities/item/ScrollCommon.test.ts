import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/objects/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Item.ScrollCommon", () => {
    TestEnv.newGame();

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();
    const inventory = actor1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_エスケープスクロール_A").id));
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
