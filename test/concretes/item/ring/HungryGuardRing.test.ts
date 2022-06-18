import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/objects/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { LEquipmentUserBehavior } from "ts/mr/objects/behaviors/LEquipmentUserBehavior";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { LFloorId } from "ts/mr/objects/LFloorId";
import { MRBasics } from "ts/mr/data/MRBasics";
import { UName } from "ts/mr/usecases/UName";
import { TestEnv } from "test/TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.ring.HungryGuardRing.test", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);
    const fp1 = player1.actualParam(MRBasics.params.fp);

    const ring1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ハングリーガードリング_A").id, [], "ring1"));
    inventory.addEntity(ring1);
    equipmentUser.equipOnUtil(ring1);

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    const fp2 = player1.actualParam(MRBasics.params.fp);
    expect(fp2).toBe(fp1);  // FP は減少していない
});
