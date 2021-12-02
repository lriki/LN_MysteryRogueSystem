import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { REGame } from "ts/re/objects/REGame";
import { REBasics } from "ts/re/data/REBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.scroll.ItemVisitorScroll", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    //const stateId = REData.getState("kState_UTかなしばり").id;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 11, 4);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_アイテムスクロール").id, [], "item1"));
    inventory.addEntity(item1);

    // item
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_アイテムスクロール").id, [], "item1"));
    REGame.world._transferEntity(item2, floorId, 19,4);  

    TestUtils.testCommonScrollBegin(player1, item1);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // expect(player1.isStateAffected(stateId)).toBeFalsy();
    // expect(enemy1.isStateAffected(stateId)).toBeTruthy();
    // expect(enemy2.isStateAffected(stateId)).toBeTruthy();
    // expect(enemy3.isStateAffected(stateId)).toBeFalsy();
    TestUtils.testCommonScrollEnd(player1, item1);
});

