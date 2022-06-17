import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LFloorId } from "ts/re/objects/LFloorId";
import { MRBasics } from "ts/re/data/MRBasics";
import { UName } from "ts/re/usecases/UName";
import { TestEnv } from "test/TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.ring.PowerRing", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;

    const player1 = TestEnv.setupPlayer(floorId, 16, 4);
    const power1 = player1.actualParam(MRBasics.params.pow);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const ring1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_パワーリング_A").id, [], "ring1"));
    inventory.addEntity(ring1);

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [装備]
    RESystem.dialogContext.postActivity(LActivity.makeEquip(player1, ring1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    const power2 = player1.actualParam(MRBasics.params.pow);
    expect(power2).toBe(power1 + 3);
});
