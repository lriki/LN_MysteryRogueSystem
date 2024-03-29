import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { TestEnv } from "../../TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemies.SleepMagician", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_メイジA").id, [], "enemy1"));
    enemy1.addState(MRData.getState("kState_Anger").id);
    TestEnv.transferEntity(enemy1, floorId, 11, 10);

    MRSystem.scheduler.stepSimulation();

    //----------------------------------------------------------------------------------------------------

    // [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // Player は睡眠状態になっている
    const stateId = MRData.getState("kState_睡眠").id;
    expect(player1.hasState(stateId)).toBe(true);
});

