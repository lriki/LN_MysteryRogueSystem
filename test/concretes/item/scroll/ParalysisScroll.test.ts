import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { REGame } from "ts/re/objects/REGame";
import { MRBasics } from "ts/re/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.scroll.ParalysisScroll", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    const stateId = REData.getState("kState_UTかなしばり").id;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_ストップスクロール_A").id, [], "item1"));
    inventory.addEntity(item1);

    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy2"));
    const enemy3 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy3"));
    REGame.world.transferEntity(enemy1, floorId, 11, 10);  // Adjacent
    REGame.world.transferEntity(enemy2, floorId, 11, 11);  // Adjacent
    REGame.world.transferEntity(enemy3, floorId, 12, 10);  // Not adjacent

    TestUtils.testCommonScrollBegin(player1, item1);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(player1.isStateAffected(stateId)).toBeFalsy();
    expect(enemy1.isStateAffected(stateId)).toBeTruthy();
    expect(enemy2.isStateAffected(stateId)).toBeTruthy();
    expect(enemy3.isStateAffected(stateId)).toBeFalsy();
    TestUtils.testCommonScrollEnd(player1, item1);
});

