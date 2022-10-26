import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { assert } from "ts/mr/Common";
import { LActivity } from "ts/mr/lively/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

// 空腹による解除チェック
test("concretes.states.Paralysis.FP", () => {
    TestEnv.newGame();
    const stateId = MRData.getState("kState_UTかなしばり").id;

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.setParamCurrentValue(MRBasics.params.fp, 40);
    player1.addState(stateId);

    let count = 0;
    while (true) {
        MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

        if (!player1.states().find(x => x.stateDataId() == stateId)) {
            break;
        }

        count++;
        assert(count < 10); // 不具合でハングしないように
    }
   
    const fp = player1.getActualParam(MRBasics.params.fp);
    expect(fp).toBe(0);    // 空腹になっている
    //expect(count > 10).toBe(true);  // 10ターンとかその程度では解除されない
});

// 攻撃による解除チェック
test("concretes.states.Paralysis.Attack", () => {
    TestEnv.newGame();
    const stateId = MRData.getState("kState_UTかなしばり").id;

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.addState(stateId);
    const hp1 = player1.getActualParam(MRBasics.params.hp);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 被ダメージにかかわらず、攻撃試行されればステートは解除されている
    const hp2 = player1.getActualParam(MRBasics.params.hp);
    expect(!player1.states().find(x => x.stateDataId() == stateId)).toBe(true);
});

test("concretes.states.Paralysis.Pos", () => {
    TestEnv.newGame();
    const stateId = MRData.getState("kState_UTかなしばり").id;
    
    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [stateId], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10);
    enemy1.dir = 2;

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(enemy1.mx).toBe(15);
    expect(enemy1.my).toBe(10);
    expect(enemy1.dir).toBe(2);
});
