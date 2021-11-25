import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LFloorId } from "ts/re/objects/LFloorId";
import { UName } from "ts/re/usecases/UName";
import { LActionTokenType } from "ts/re/objects/LActionToken";
import { ULimitations } from "ts/re/usecases/ULimitations";
import { paramMaxTrapsInMap } from "ts/re/PluginParameters";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.scroll.PlatingScroll", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    const stateId = REData.getState("kState_System_Plating").id;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_レデューススクロール").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_レデューススクロール").id, [], "item1"));
    const item3 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_レデューススクロール").id, [], "item1"));
    const item4 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_レデューススクロール").id, [], "item1"));
    inventory.addEntity(item1);
    inventory.addEntity(item2);
    inventory.addEntity(item3);
    inventory.addEntity(item4);
    
    // 対象アイテム
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [], "weapon1"));
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1, [], "shield2"));
    const ring1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kアウェイクリング").id, [], "ring1"));
    const grass1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb, [], "grass1"));
    inventory.addEntity(weapon1);
    inventory.addEntity(shield1);
    inventory.addEntity(ring1);
    inventory.addEntity(grass1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1, [weapon1]));
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1, [shield1]));
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1, [ring1]));
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1, [grass1]).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(weapon1.isStateAffected(stateId)).toBe(true);
    expect(shield1.isStateAffected(stateId)).toBe(true);
    expect(ring1.isStateAffected(stateId)).toBe(false);
    expect(grass1.isStateAffected(stateId)).toBe(false);
});
