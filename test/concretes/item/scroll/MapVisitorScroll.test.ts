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
import { SView } from "ts/re/system/SView";
import { SNavigationHelper } from "ts/re/system/SNavigationHelper";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.scroll.MapVisitorScroll", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 11, 4);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // 隣の部屋の中央は 19,4

    // item
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_マップスクロール_A").id, [], "item1"));
    inventory.addEntity(item1);

    // Enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 19, 4);
    
    // trap1 
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap, [], "trap1"));
    REGame.world._transferEntity(trap1, floorId, 20, 4);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(REGame.map.block(19, 4)._passed).toBeTruthy();
    
    const visibility2 = SView.getEntityVisibility(enemy1);
    expect(visibility2.visible).toBeTruthy();

    const trap1Visibility2 = SView.getEntityVisibility(trap1);
    expect(trap1Visibility2.visible).toBeTruthy();
    expect(SNavigationHelper.testVisibilityForMinimap(player1, trap1)).toBeTruthy();
});

