import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { REBasics } from "ts/re/data/REBasics";
import { assert } from "ts/re/Common";
import { LActivity } from "ts/re/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

// 空腹による解除チェック
test("concretes.states.Paralysis.FP", () => {
    TestEnv.newGame();
    const stateId = REData.getState("kState_UTかなしばり").id;

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.setActualParam(REBasics.params.fp, 40);
    player1.addState(stateId);

    let count = 0;
    while (true) {
        RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

        if (!player1.states().find(x => x.stateDataId() == stateId)) {
            break;
        }

        count++;
        assert(count < 10); // 不具合でハングしないように
    }
   
    const fp = player1.actualParam(REBasics.params.fp);
    expect(fp).toBe(0);    // 空腹になっている
    //expect(count > 10).toBe(true);  // 10ターンとかその程度では解除されない
});

// 攻撃による解除チェック
test("concretes.states.Paralysis.Attack", () => {
    TestEnv.newGame();
    const stateId = REData.getState("kState_UTかなしばり").id;

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.addState(stateId);
    const hp1 = player1.actualParam(REBasics.params.hp);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 被ダメージにかかわらず、攻撃試行されればステートは解除されている
    const hp2 = player1.actualParam(REBasics.params.hp);
    expect(!player1.states().find(x => x.stateDataId() == stateId)).toBe(true);
});

test("concretes.states.Paralysis.Pos", () => {
    TestEnv.newGame();
    const stateId = REData.getState("kState_UTかなしばり").id;
    
    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [stateId], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10);
    enemy1.dir = 2;

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(enemy1.mx).toBe(15);
    expect(enemy1.my).toBe(10);
    expect(enemy1.dir).toBe(2);
});
