import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { REGame } from "ts/mr/lively/REGame";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.scroll.PlatingScroll", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    const stateId = MRData.getState("kState_System_Plating").id;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_メッキの巻物_A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_メッキの巻物_A").id, [], "item1"));
    const item3 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_メッキの巻物_A").id, [], "item1"));
    const item4 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_メッキの巻物_A").id, [], "item1"));
    inventory.addEntity(item1);
    inventory.addEntity(item2);
    inventory.addEntity(item3);
    inventory.addEntity(item4);
    
    // 対象アイテム
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [], "weapon1"));
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1, [], "shield2"));
    const ring1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_目覚めの指輪_A").id, [], "ring1"));
    const grass1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb, [], "grass1"));
    inventory.addEntity(weapon1);
    inventory.addEntity(shield1);
    inventory.addEntity(ring1);
    inventory.addEntity(grass1);

    TestUtils.testCommonScrollBegin(player1, item1);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1, [weapon1]));
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1, [shield1]));
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1, [ring1]));
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1, [grass1]).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(weapon1.isStateAffected(stateId)).toBe(true);
    expect(shield1.isStateAffected(stateId)).toBe(true);
    expect(ring1.isStateAffected(stateId)).toBe(false);
    expect(grass1.isStateAffected(stateId)).toBe(false);
    TestUtils.testCommonScrollEnd(player1, item1);
});

