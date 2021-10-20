import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { REData } from "ts/re/data/REData";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { REGame } from "ts/re/objects/REGame";
import { RESystem } from "ts/re/system/RESystem";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { TestEnv } from "../../TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemies.SleepMagician", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_メイジA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 11, 10);

    RESystem.scheduler.stepSimulation();

    //----------------------------------------------------------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    REGame.world.random().resetSeed(5);     // 乱数調整
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // Player は睡眠状態になっている
    const stateId = REData.getState("kState_UT睡眠").id;
    expect(player1.hasState(stateId)).toBe(true);
});

