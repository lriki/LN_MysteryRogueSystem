import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { TestEnv } from "../../TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemies.WarpMagician", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_追放メイジ_A").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, floorId, 11, 10);

    MRSystem.scheduler.stepSimulation();

    //----------------------------------------------------------------------------------------------------

    // 待機
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRLively.world.random().resetSeed(5);     // 乱数調整
    MRSystem.scheduler.stepSimulation();

    // player1 はワープしている
    expect(player1.mx != 10 && player1.my != 10).toBe(true);
});

