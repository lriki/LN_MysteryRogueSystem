import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.effect.Escape", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(TestEnv.StateId_CertainDirectAttack);
    const hp1 = actor1.getActualParam(MRBasics.params.hp);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_撤退テストA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // 待機
    MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.isDestroyed()).toBe(true);

});
