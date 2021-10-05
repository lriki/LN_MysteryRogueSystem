import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemy.X2Speed1Attack", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(TestEnv.StateId_CertainDirectAttack);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_ウルフ").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 14, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // [待機]
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // 倍速で近づいて来る
    expect(enemy1.x).toBe(12);

    // [待機]
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // Minor で接近し、Major で攻撃が発生している
    expect(enemy1.x).toBe(11);
    expect(TestEnv.integration.skillEmittedCount).toBe(1);

    // 封印
    enemy1.addState(REData.getStateFuzzy("kState_UT封印").id);
    
    // [←]
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 4).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // 封印されているので等速
    expect(enemy1.x).toBe(10);
    expect(TestEnv.integration.skillEmittedCount).toBe(1);

});