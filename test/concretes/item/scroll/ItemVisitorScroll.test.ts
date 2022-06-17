import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/re/data/MRData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { REGame } from "ts/re/objects/REGame";
import { MRBasics } from "ts/re/data/MRBasics";
import { SNavigationHelper } from "ts/re/system/SNavigationHelper";
import { SView } from "ts/re/system/SView";

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
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_アイテムスクロール_A").id, [], "item1"));
    inventory.addEntity(item1);

    // item
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_アイテムスクロール_A").id, [], "item1"));
    REGame.world.transferEntity(item2, floorId, 19, 4);  

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const minimap = RESystem.minimapData;
    minimap.update();
    expect(SNavigationHelper.testVisibilityForMinimap(player1, item2)).toBeFalsy();
    expect(SView.getMinimapVisibility(item2).visible).toBeFalsy();
    expect(minimap.getData(19, 4, 1)).toBe(0);

    //----------------------------------------------------------------------------------------------------

    // [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    minimap.update();
    expect(SNavigationHelper.testVisibilityForMinimap(player1, item2)).toBeTruthy();
    expect(SView.getMinimapVisibility(item2).visible).toBeTruthy();
    expect(minimap.getData(19, 4, 1)).toBe(minimap.itemMarkerTileId());
});

