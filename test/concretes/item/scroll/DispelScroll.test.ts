import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/lively/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.scroll.DispelScroll", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    const stateId = MRData.system.states.curse;

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_おはらいの巻物_A").id, [], "item1"));
    inventory.addEntity(item1);
    
    // 装備 (呪い付き)
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [stateId], "weapon1"));
    const weapon2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [stateId], "weapon2"));
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1, [stateId], "shield1"));
    const shield2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1, [stateId], "shield2"));
    inventory.addEntity(weapon1);
    inventory.addEntity(weapon2);
    inventory.addEntity(shield1);
    inventory.addEntity(shield2);
    equipmentUser.equipOnUtil(weapon1);
    equipmentUser.equipOnUtil(shield1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const m = REGame.messageHistory;

    expect(weapon1.isStateAffected(stateId)).toBe(false);
    expect(weapon2.isStateAffected(stateId)).toBe(true);
    expect(shield1.isStateAffected(stateId)).toBe(false);
    expect(shield2.isStateAffected(stateId)).toBe(true);
});

