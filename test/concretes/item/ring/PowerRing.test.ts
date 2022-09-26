import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/lively/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";
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

    const ring1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ちからの指輪_A").id, [], "ring1"));
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
