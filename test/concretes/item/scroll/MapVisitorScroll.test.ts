import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { REGame } from "ts/mr/objects/REGame";
import { MRBasics } from "ts/mr/data/MRBasics";
import { SView } from "ts/mr/system/SView";
import { SNavigationHelper } from "ts/mr/system/SNavigationHelper";

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
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_マップスクロール_A").id, [], "item1"));
    inventory.addEntity(item1);

    // Enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 19, 4);
    
    // trap1 
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap, [], "trap1"));
    REGame.world.transferEntity(trap1, floorId, 20, 4);

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

    //----------------------------------------------------------------------------------------------------
    
    const floorId2 = TestEnv.FloorId_UnitTestFlatMap50x50;
    
    REGame.world.transferEntity(player1, floorId2, 10, 10);
    TestEnv.performFloorTransfer();

    // マップを切り替えれば可視フラグはリセットされる
    expect(REGame.map.unitClarity).toBeFalsy();
    expect(REGame.map.itemClarity).toBeFalsy();
    expect(REGame.map.trapClarity).toBeFalsy();
    expect(REGame.map.sightClarity).toBeFalsy();
});

