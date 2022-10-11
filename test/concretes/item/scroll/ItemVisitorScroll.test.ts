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
import { SNavigationHelper } from "ts/mr/system/SNavigationHelper";
import { SView } from "ts/mr/system/SView";

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
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_千里眼の巻物_A").id, [], "item1"));
    inventory.addEntity(item1);

    // item
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_千里眼の巻物_A").id, [], "item1"));
    MRLively.world.transferEntity(item2, floorId, 19, 4);  

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const minimap = MRSystem.minimapData;
    minimap.update();
    expect(SNavigationHelper.testVisibilityForMinimap(player1, item2)).toBeFalsy();
    expect(SView.getMinimapVisibility(item2).visible).toBeFalsy();
    expect(minimap.getData(19, 4, 1)).toBe(0);

    //----------------------------------------------------------------------------------------------------

    // [読む]
    MRSystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    minimap.update();
    expect(SNavigationHelper.testVisibilityForMinimap(player1, item2)).toBeTruthy();
    expect(SView.getMinimapVisibility(item2).visible).toBeTruthy();
    expect(minimap.getData(19, 4, 1)).toBe(minimap.itemMarkerTileId());
});

