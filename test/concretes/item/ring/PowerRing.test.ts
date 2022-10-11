import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
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

    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [装備]
    MRSystem.dialogContext.postActivity(LActivity.makeEquip(player1, ring1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------

    const power2 = player1.actualParam(MRBasics.params.pow);
    expect(power2).toBe(power1 + 3);
});
