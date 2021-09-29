import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.Gold", () => {
    TestEnv.newGame();

    /*
    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const inventory1 = actor1.getEntityBehavior(LInventoryBehavior);
    
    // gold1
    const gold1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_ゴールド").id, [], "gold1"));
    REGame.world._transferEntity(gold1, TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);

    // gold1
    const gold2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_ゴールド").id, [], "gold2"));
    REGame.world._transferEntity(gold2, TestEnv.FloorId_UnitTestFlatMap50x50, 11, 10);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_UnitTestFlatMap50x50, 20, 10);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 拾う
    RESystem.dialogContext.postActivity(LActivity.makePick(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    inventory1.gold()
    */

    // // まどわし状態になる
    // expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UTまどわし").id)).toBe(true);

    // // [投げる]
    // RESystem.dialogContext.postActivity(LActivity.makeThrow(actor1, item2).withEntityDirection(6).withConsumeAction());
    // RESystem.dialogContext.activeDialog().submit();

    // RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // // まどわし状態になる
    // expect(!!enemy1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UTまどわし").id)).toBe(true);
    
});

