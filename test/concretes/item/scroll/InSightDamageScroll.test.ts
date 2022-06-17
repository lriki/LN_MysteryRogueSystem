import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { MRBasics } from "ts/re/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.scroll.InSightDamageScroll", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const player1HP1 = player1.actualParam(MRBasics.params.hp);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_ストームスクロール_A").id, [], "item1"));
    inventory.addEntity(item1);

    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy2"));
    REGame.world.transferEntity(enemy1, floorId, 15, 10);
    REGame.world.transferEntity(enemy2, floorId, 10, 15);
    const enemy1HP1 = enemy1.actualParam(MRBasics.params.hp);
    const enemy2HP1 = enemy2.actualParam(MRBasics.params.hp);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const player1HP2 = player1.actualParam(MRBasics.params.hp);
    const enemy1HP2 = enemy1.actualParam(MRBasics.params.hp);
    const enemy2HP2 = enemy2.actualParam(MRBasics.params.hp);
    expect(player1HP2).toBe(player1HP1);
    expect(enemy1HP2).toBeLessThan(enemy1HP1);
    expect(enemy2HP2).toBeLessThan(enemy2HP1);
});

