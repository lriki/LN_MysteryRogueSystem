import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRSystem } from "ts/mr/system/MRSystem";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { TestEnv } from "../../TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.Anger", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const pow1 = player1.getActualParam(MRBasics.params.pow);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_ゾンビA").id, [], "enemy1"));
    enemy1.addState(MRData.getState("kState_Anger").id);
    TestEnv.transferEntity(enemy1, floorId, 11, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    for (let i = 0; i < 100; i++) {
        // ちからを戻しておく
        player1.setParamCurrentValue(MRBasics.params.pow, pow1);

        // 待機
        MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();

        MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

        // ちからが減っている
        const pow2 = player1.getActualParam(MRBasics.params.pow);
        expect(pow2).toBe(pow1 - 1);
    }
});

