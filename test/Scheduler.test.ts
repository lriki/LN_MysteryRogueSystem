import { DBasics } from "ts/data/DBasics";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "./TestEnv";
import { REData } from "ts/data/REData";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { LActivity } from "ts/objects/activities/LActivity";
import { LUnitBehavior } from "ts/objects/behaviors/LUnitBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Scheduler.ChangeSpeed", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 10, 11);
    enemy1.addState(DBasics.states.debug_MoveRight);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 倍速化して [待機]
    actor1.getBehavior(LUnitBehavior).setSpeedLevel(2);
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.x).toBe(10);  // まだ enemy にターンは回らないので移動していない

    // [待機]
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.x).toBe(11);  // enemy にターンは回って移動してる
});

