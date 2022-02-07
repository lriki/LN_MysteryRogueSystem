import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { REGame } from "ts/re/objects/REGame";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.scroll.ChangeToFoodScroll", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_フランスパンスクロール_A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_フランスパンスクロール_A").id, [], "item2"));
    inventory.addEntity(item1);
    inventory.addEntity(item2);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1, [item2]).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const items = inventory.entities();
    expect(items.length).toBe(1);
    expect(items[0].data().entity.key).toBe("kフランスパン");
    expect(item2.isDestroyed()).toBeFalsy();    // Entity が変異しただけなので、インスタンス自体は削除されていない
    expect(REGame.messageHistory.includesText("変化した")).toBeTruthy();
});

