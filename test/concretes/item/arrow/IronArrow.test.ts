import { MRBasics } from "ts/mr/data/MRBasics";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { TestUtils } from "test/TestUtils";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.arrow.IronArrow", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // player1 配置
    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    player1.addState(MRData.getState("kState_UnitTest_投擲必中").id);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_鉄の矢A").id, [], "item1"));
    inventory.addEntity(item1);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 13, 10);
    const initialHP = enemy1.getActualParam(MRBasics.params.hp);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    TestUtils.testCommonArrow(item1);
    
    // [撃つ]
    const activity1 = LActivity.makeShooting(player1, item1).withConsumeAction();
    MRSystem.dialogContext.postActivity(activity1);
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const hp = enemy1.getActualParam(MRBasics.params.hp);
    expect(hp < initialHP).toBeTruthy();      // ダメージを受けているはず
});


