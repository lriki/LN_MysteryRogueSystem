import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.scroll.ParalysisScroll", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    const stateId = MRData.getState("kState_UTかなしばり").id;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_かなしばりの巻物_A").id, [], "item1"));
    inventory.addEntity(item1);

    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy2"));
    const enemy3 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy3"));
    MRLively.world.transferEntity(enemy1, floorId, 11, 10);  // Adjacent
    MRLively.world.transferEntity(enemy2, floorId, 11, 11);  // Adjacent
    MRLively.world.transferEntity(enemy3, floorId, 12, 10);  // Not adjacent

    TestUtils.testCommonScrollBegin(player1, item1);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    MRSystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(player1.isStateAffected(stateId)).toBeFalsy();
    expect(enemy1.isStateAffected(stateId)).toBeTruthy();
    expect(enemy2.isStateAffected(stateId)).toBeTruthy();
    expect(enemy3.isStateAffected(stateId)).toBeFalsy();
    TestUtils.testCommonScrollEnd(player1, item1);
});

