import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { LActionTokenType } from "ts/mr/lively/LActionToken";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.WarpGrass", () => {
    TestEnv.newGame();
    
    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_UnitTestFlatMap50x50, 15, 10);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_高跳び草_A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_高跳び草_A").id, [], "item1"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    TestUtils.testCommonGrassBegin(player1, item1);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [投げる]
    MRSystem.dialogContext.postActivity(LActivity.makeThrow(player1, item2).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // ワープしている
    expect(enemy1.mx == 15 && enemy1.my == 10).toBeFalsy();

    //----------------------------------------------------------------------------------------------------
    
    // [食べる]
    MRSystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // ワープしている
    expect(player1.mx == 10 && player1.my == 10).toBeFalsy();

    TestUtils.testCommonGrassEnd(player1, item1);
});

