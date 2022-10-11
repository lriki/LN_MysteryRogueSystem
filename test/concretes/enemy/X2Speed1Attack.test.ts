import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemy.X2Speed1Attack", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(TestEnv.StateId_CertainDirectAttack);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_ウルフA").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 14, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 倍速で近づいて来る
    expect(enemy1.mx).toBe(12);

    //----------------------------------------------------------------------------------------------------

    // [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // Minor で接近し、Major で攻撃が発生している
    expect(enemy1.mx).toBe(11);
    expect(TestEnv.integration.skillEmittedCount).toBe(1);

    //----------------------------------------------------------------------------------------------------

    // Enemy を封印
    enemy1.addState(MRData.getState("kState_System_Seal").id);
    
    // [←]
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 4).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 封印されているので等速
    expect(enemy1.mx).toBe(10);
    expect(TestEnv.integration.skillEmittedCount).toBe(1);
    
    //----------------------------------------------------------------------------------------------------

    // [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 1回攻撃が来る
    expect(TestEnv.integration.skillEmittedCount).toBe(2);
});
